const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');


exports.staff = async (req, res, next) => {
  try {
    const staff = await User.find({type: {$ne: 'user'}});

    if (!staff)
      return next(new ErrorResponse("Ce membre staff n'existe plus.", 404));
  
    return res.status(200).json({success: true, staff});
    
  } catch (error) { return next(new ErrorResponse('Erreur de récupération du personnel.', 500)); }
};


exports.create = async (req, res, next) => {
  try {
    // Do all checks for field entries before checking uniqueness of username & email address
    const {firstName, lastName, email, password, passCheck, type} = req.body;

    if (!(firstName && lastName && email && password && passCheck && type))
      return next(new ErrorResponse('Veuillez remplir tous les champs nécessaires.', 400));

    if (password.length < 6)
      return next(new ErrorResponse('Le mot de passe doit contenir au moins 6 caractères.', 400));

    if (password !== passCheck)
      return next(new ErrorResponse('Les mots de passes entrés sont différents.', 400));

      
    // Check uniqueness of email address
    const emailExists = await User.findOne({email});
    if (emailExists)
      return next(new ErrorResponse(`L'adresse email "${email}" est déjà prise, veuillez en utiliser une autre.`, 409));


    const staff = await User.create({firstName, lastName, email, password, type});

    return res.status(201).json({success: true});

  } catch (error) { return next(new ErrorResponse('Erreur de création du membre staff.', 500)); }
};


exports.update = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Erreur de modification du membre staff.', 400));

  try {
    const staff = await User.findById(req.params.id);

    if (!staff)
      return next(new ErrorResponse("Ce membre staff n'existe plus.", 404));

    const {firstName, lastName, password, email, type} = req.body;

    if (!firstName || !lastName || !email)
      return next(new ErrorResponse('Veuillez fournir le nom, prénom et adresse email du membre.', 400));

    if (password) {
      if (password.length < 6)
        return next(new ErrorResponse('Le mot de passe doit contenir au moins 6 caractères.', 400));
      staff.password = password;
    }

    staff.firstName = firstName;
    staff.lastName = lastName;
    staff.email = email;
    staff.type = type;

    await staff.save();

    return res.status(201).json({success: true});

  } catch (error) { return next(new ErrorResponse('Erreur de modification du membre staff.', 500)); }
};


exports.remove = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user)
      return next(new ErrorResponse("Ce membre staff n'existe plus.", 404));

    return res.status(201).json({success: true});

  } catch (error) { return next(new ErrorResponse('Erreur de suppression du membre staff.', 500)); }
};