const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


const getPeriod = (period) => {
  if (period === 1) return 'Matin';
  if (period === 2) return 'Midi';
  if (period === 3) return 'Après-midi';
  if (period === 4) return 'Soir';
};


exports.bookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({'user.email': req.user.email});

    return res.status(200).json({success: true, bookings});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération des réservations.', 500)); }
};


exports.dayBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      dateBooked: {
        $gte: new Date(Number(req.params.day)).setHours(0,0,0,0),
        $lt: new Date(Number(req.params.day)).setHours(23,59,59,999)
      }
    });

    return res.status(200).json({success: true, bookings});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération des réservations.', 500)); }
};


exports.booking = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse('Erreur de récupération de la réservation.', 400));

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse("Cette réservation n'existe plus.", 404));

    if (req.user.type === 'user' && req.user._id !== booking.user._id)
      return next(new ErrorResponse('Vous ne pouvez pas accéder à cette réservation.', 403));

    return res.status(200).json({success: true, booking});

  } catch (error) { return next(new ErrorResponse('Erreur de récupération de la réservation.', 500)); }
};


exports.create = async (req, res, next) => {
  const {user, dateBooked, period, table} = req.body;

  if (!user)
    return next(new ErrorResponse('Erreur de création de la réservation.', 401));

  if (req.user.type === 'waiter' && (!user.firstName || !user.lastName || !user.email))
    return next(new ErrorResponse('Veuillez fournir le nom, prénom et adresse email de votre client.', 400));


  try {
    const dtOpts = {
      timeZone: 'Europe/Paris',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    const content = `
      <h2>${user.firstName || user.email.substr(0, user.email.indexOf('@'))},</h2>
      <h3>Votre réservation a bien été enregistrée.</h3><br/>
      <p>Pour rappel, voici les informations de votre réservation :</p>
      <ul>
        <li>Date : ${new Intl.DateTimeFormat([], dtOpts).format(new Date(dateBooked)).substr(0, 10)}</li>
        <li>Période : ${getPeriod(period)}</li>
        <li>Table : n°${table}</li>
      </ul><br/>
      <h4>Merci d'avoir commandé chez The Good Fork, nous espérons que votre expérience sera positive.</h4>
      <p>The Good Fork &copy; - 2021</p>
    `;
    
    const booking = await Booking.create({
      user,
      dateSent: Date.now(),
      dateBooked,
      period,
      table,
      bookedBy: req.user.email
    });

    sendEmail({email: user.email, subject: 'The Good Fork - Réservation', content});
    return res.status(200).json({success: true, booking});
    
  } catch (error) { return next(new ErrorResponse('Erreur de création de la réservation.', 500)); }
};


exports.update = async (req, res, next) => {
  const newBooking = req.body;

  if (!req.params.id)
    return next(new ErrorResponse('Erreur de modification de la réservation.', 400));

    
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse("Cette réservation n'existe plus.", 404));

    if (req.user.type === 'user' && req.user.email !== booking.user.email)
      return next(new ErrorResponse('Vous ne pouvez pas modifier cette réservation.', 403));

    booking.daySent = Date.now();
    booking.table = newBooking.table;
    booking.period = newBooking.period;
    booking.dateBooked = newBooking.dateBooked;

    booking.save();
    return res.status(200).json({success: true, booking});

  } catch (error) { return next(new ErrorResponse('Erreur de modification de la réservation.', 500)); }
};


exports.remove = async (req, res, next) => {
  if (!req.params.id)
    return next(new ErrorResponse("Erreur d'annulation de la réservation.", 400));

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse("Erreur d'annulation de la réservation.", 404));
    
    if (req.user.type === 'user' && req.user.email !== booking.user.email)
      return next(new ErrorResponse('Vous ne pouvez pas annuler cette réservation.', 403));

    await Booking.findByIdAndDelete(booking._id);

    return res.status(200).json({success: true});
    
  } catch (error) { console.log(error); return next(new ErrorResponse("Erreur d'annulation de la réservation.", 500)); }
};