require('dotenv').config({path: './config.env'});

const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SK);

const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


exports.register = async (req, res, next) => {
  const {firstName, lastName, email, password, passCheck, type} = req.body;
      
  // Do all checks for field entries before checking uniqueness of username & email address
  if (!(firstName && lastName && email && password && passCheck && type))
    return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));

  if (password.length < 6)
    return next(new ErrorResponse('Le mot de passe doit contenir au moins 6 caractères.', 400));

  if (password !== passCheck)
    return next(new ErrorResponse('Les mots de passes entrés sont différents.', 400));


  try {
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new Error('Un autre utilisateur est déjà enregistré avec cette adresse email.', 409));

    const stripeUser = await stripe.customers.create({email, name: `${firstName} ${lastName}`});

    const user = await User.create({firstName, lastName, email, password, type, stripeId: stripeUser.id});

    user.password = undefined;
    return sendToken(user, 201, res);

  } catch (error) { next(new ErrorResponse('Erreur de création de compte.', 500)); }
};


exports.login = async (req, res, next) => {
  const {email, password, remember = null} = req.body;

  if (!email || !password)
    return next(new ErrorResponse('Veuillez entrer votre adresse email et mot de passe.', 400));


  try {
    const user = await User.findOne({email}).select('+password');

    if (!user)
      return next(new ErrorResponse('Identifiants invalides.', 404));

    const isMatch = await user.matchPasswords(password);

    if (!isMatch)
      return next(new ErrorResponse('Identifiants invalides.', 401));

    if (user.type !== 'admin' && remember !== null) // Only admins can connect to the web portal
      return next(new ErrorResponse('Seuls les administrateurs peuvent se connecter au portail web.', 403))

    user.password = undefined; // Determine if login comes from website or mobile app
    return remember === null ? sendToken(user, 200, res) : sendCookie(user, remember, 200, res);

  } catch (error) { next(new ErrorResponse('Erreur de connexion.', 500)); }
};


exports.logout = async (req, res, next) => {
  try {
    res.clearCookie('authToken').json({success: true});
  } catch (error) { next(new ErrorResponse('Erreur de déconnexion.', 500)); }
};


exports.forgot = async (req, res, next) => {
  const {email, admin = null} = req.body;

  if (!email)
    return next(new ErrorResponse('Veuillez fournir votre adresse email.', 400));


  try {
    const user = await User.findOne({email});

    if (!user)
      return next(new ErrorResponse("Il n'existe aucun compte sous cette adresse email.", 404));

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const domain = process.env.NODE_ENV === 'development' ? 'https://localhost:3000/reset/' : 'https://the-good-fork.herokuapp.com/reset/';

    const content = `
      <h2>${user.firstName || user.email},</h2>
      <h3>Vous nous avez envoyé une demande de récupération.</h3><br/>
      <p>Veuillez ${admin ? "ouvrir ce lien dans votre navigateur" : "copier ce code de récupération dans l'application :"}
        <br/>${admin ? '<a href="' + domain + resetToken +'">Lien de récupération</a>' : resetToken}
      </p><br/>
      <p>Si vous avez entré le code correctement, votre compte sera sécurisé avec votre nouveau mot de passe.</p>
      <h4>Merci d'utiliser nos services et de rendre votre compte plus sécurisé.</h4>
      <p>The Good Fork &copy; - 2021</p>
    `;
    
    sendEmail({email, subject: 'The Good Fork - Récupération de compte', content});

    return res.status(200).json({success: true});

  } catch (error) { next(new ErrorResponse("Erreur d'envoi de l'email de récupération.", 500)); }

};


exports.reset = async (req, res, next) => {
  const {password, passCheck} = req.body;

  if (!password || !passCheck || !req.params.token)
    return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  if (password.length < 6)
    return next(new ErrorResponse('Le mot de passe doit contenir au moins 6 caractères.', 400));

  if (password !== passCheck)
    return next(new ErrorResponse('Les mots de passes entrés sont différents.', 400));


  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {$gt: Date.now()} // Check if current time is still in the token expiration timeframe
    });

    if (!user)
      return next(new ErrorResponse('Le code de récupération entré est incorrect ou a expiré après 15 minutes.', 400));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(201).json({success: true});
  
  } catch (error) { next(new ErrorResponse('Erreur de réinitialisation du mot de passe.', 500)) }
};


exports.data = async (req, res, next) => {
  try {
    return res.status(200).json({success: true, user: req.user});
  } catch (error) { return next(new ErrorResponse('Erreur de récupération de vos informations.', 500)); }
};


exports.updateData = async (req, res, next) => {
  const {firstName, lastName, email} = req.body;

  if (!(firstName && lastName && email))
    return next(new Error('Veuillez remplir tous les champs nécessaires.'), 400);

  try {
    const exists = await User.findOne({email});

    if (exists && exists.email !== req.user.email)
      return next(new Error('Un autre utilisateur est déjà enregistré avec cette adresse email.', 409));

    await User.updateOne({email: req.user.email}, {firstName, lastName, email});

    // The following is necessary because we need to be able to take bookings & orders even for unregistered users
    await Booking.updateMany({'user.email': req.user.email}, {$set: {
      'user.firstName': firstName,
      'user.lastName': lastName,
      'user.email': email
    }});
    await Booking.updateMany({bookedBy: req.user.email}, {$set: {bookedBy: email}});

    // The following is necessary because we need to be able to take bookings & orders even for unregistered users
    await Order.updateMany({'user.email': req.user.email}, {$set: {
      'user.firstName': firstName,
      'user.lastName': lastName,
      'user.email': email
    }});
    await Order.updateMany({orderedBy: req.user.email}, {$set: {orderedBy: email}});

    const user = await User.findOne({email});

    return res.status(200).json({success: true, user});

  } catch (error) { return next(new ErrorResponse('Erreur de mise à jour du compte.', 500)); }
};


exports.updatePw = async (req, res, next) => {
  const {current, password, passCheck} = req.body;

  if (!current || !password || !passCheck)
    return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));

  if (password.length < 6)
    return next(new ErrorResponse('Le mot de passe doit contenir au moins 6 caractères.', 400));

  if (password !== passCheck)
    return next(new ErrorResponse('Les mots de passes entrés sont différents.', 400));


  try {
    const user = await User.findOne({email: req.user.email}).select('+password');

    const isMatch = await user.matchPasswords(current);

    if (!isMatch)
      return next(new ErrorResponse('Votre mot de passe actuel est incorrect.', 400));

    user.password = password;
    await user.save();

    return res.status(201).json({success: true});
  
  } catch (error) { next(new ErrorResponse('Erreur de modification du mot de passe.', 500)) }
};


exports.remove = async (req, res, next) => {
  try {
    return next(new Error('La suppression de compte sera disponible dans une prochaine mise à jour.'), 400);

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({success: true});

  } catch (error) { return next(new ErrorResponse('Erreur de suppression de compte.', 500)); }
};


const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken(process.env.JWT_EXPIRES);
  res.status(statusCode).json({success: true, token, user});
};


const sendCookie = (user, remember, statusCode, res) => {
  const token = user.getSignedToken('16h');

  res.cookie('authToken', token, {
    expires: remember ? new Date(Date.now() + 57600000) : false, // 16h or session
    sameSite: 'Strict',
    httpOnly: true,
    secure: true
  }).status(statusCode).json({success: true, user});
};