const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');


const getPeriod = (period) => {
  if (period === 1) return 'Matin';
  if (period === 2) return 'Midi';
  if (period === 3) return 'Après-midi';
  if (period === 4) return 'Soir';
};


exports.getBookings = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not retrieve this booking, please try again or sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve this booking, please try again.', 404));


    const bookings = await Booking.find({'user.email': user.email});

    return res.status(200).json({success: true, bookings});

  } catch (error) { return next(new ErrorResponse('Could not retrieve bookings.', 500)); }
};


exports.getDayBookings = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not retrieve this booking, please try again or sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve this booking, please try again.', 404));


    const bookings = await Booking.find({
      dateBooked: {
        $gte: new Date(Number(req.params.day)).setHours(0,0,0,0),
        $lt: new Date(Number(req.params.day)).setHours(23,59,59,999)
      }
    }); 

    return res.status(200).json({success: true, bookings});

  } catch (error) { return next(new ErrorResponse('Could not retrieve bookings.', 500)); }
};


exports.getBooking = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not retrieve this booking, please try again or sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your booking information.', 400));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve this booking, please try again.', 404));


    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse('Could not retrieve this booking, please try again.', 404));

    if (user.type === 'user' && user._id !== booking.user._id)
      return next(new ErrorResponse('You are not allowed to view this booking.', 403));

    return res.status(200).json({success: true, booking});

  } catch (error) { return next(new ErrorResponse('Could not retrieve this booking.', 500)); }
};


exports.createBooking = async (req, res, next) => {
  let token;
  const {user, dateBooked, period, table} = req.body;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token || !user)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id);

    if (!user)
      return next(new ErrorResponse('Could not retrieve your booking information.', 404));

    const dtOpts = {
      timeZone: 'Europe/London',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    };

    const content = `
      <h2>${user?.firstName || user?.email?.substr(0, user?.email?.indexOf('@'))},</h2>
      <br/><h3>Votre réservation a bien été enregistrée.</h3><br/>
      <p>Pour rappel, voici les informations de votre réservation :</p>
      <ul>
        <li>Date : ${new Intl.DateTimeFormat([], dtOpts).format(new Date())}</li>
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
      table
    });

    sendEmail({email: user.email, subject: 'The Good Fork - Réservation', content});
    return res.status(200).json({success: true, booking});
    
  } catch (error) { return next(new ErrorResponse('Could not create your booking.', 500)); }
};


exports.updateBooking = async (req, res, next) => {
  let token;
  const newBooking = req.body;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not verify your account, please sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your booking information.', 400));

    
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse('Could not find your booking, please try again.', 404));

    booking.daySent = Date.now();
    booking.dateBooked = newBooking.dateBooked;
    booking.table = newBooking.table;
    booking.period = newBooking.period;

    booking.save();
    return res.status(200).json({success: true, booking});

  } catch (error) { return next(new ErrorResponse('Could not update your booking.', 500)); }
};


exports.deleteBooking = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next(new ErrorResponse('Could not get your bookings, please sign out then in again.', 401));

  if (!req.params.id)
    return next(new ErrorResponse('Could not retrieve your booking information.', 400));

    
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking)
      return next(new ErrorResponse('Could not delete your booking, please try again.', 404));
    
    await Booking.findByIdAndDelete(booking._id);

    return res.status(200).json({success: true});
    
  } catch (error) { console.log(error); return next(new ErrorResponse('Could not delete your booking.', 500)); }
};