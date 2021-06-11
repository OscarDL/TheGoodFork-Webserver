require('dotenv').config({path: './config.env'});

const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const cookieParser = require('cookie-parser');
const RateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');


// app & db config
const port = process.env.PORT;
const app = express();
connectDB();

const rateLimiter = new RateLimit({
  windowMs: 300000, // 5 minutes
  max: 100 // 100 requests max
});


// middleware

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", "fonts.gstatic.com"],
    imgSrc: ["'self'", "res.cloudinary.com"],
    connectSrc: ["'self'", "api.stripe.com"]
  }
}));

app.use(cookieParser());
app.use(express.json());
app.use(mongoSanitize());

if (process.env.NODE_ENV !== 'production') {
  const corsOpts = {
    credentials: true,
    origin: ['https://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  };

  app.use(require('cors')(corsOpts));
}

app.use('/api/v1', rateLimiter);
app.use('/api/v1/user', require('./routes/user'));
app.use('/api/v1/staff', require('./routes/staff'));
app.use('/api/v1/dishes', require('./routes/dishes'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/stripe', require('./routes/stripe'));
app.use('/api/v1/tables', require('./routes/tables'));
app.use('/api/v1/bookings', require('./routes/bookings'));

app.use(errorHandler); // needs to be last middleware used here


// On Heroku, serve the React client as a static file
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, path.sep, '..', path.sep, 'client', 'build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, path.sep, '..', path.sep, 'client', 'build', 'index.html')));
}


// server startup
if (process.env.NODE_ENV === 'production') {

  app.listen(port);

  process.on('unhandledRejection', (errorLogged, _) => {
    console.log('Error log');
    console.log(errorLogged);
  });

} else {

  const key = require('fs').readFileSync('key.pem', 'utf8');
  const cert = require('fs').readFileSync('cert.pem', 'utf8');

  const httpsServer = https.createServer({key, cert}, app);
  const server = httpsServer.listen(port, () => console.log('Listening on port ' + port));
  
  process.on('unhandledRejection', (errorLogged, _) => {
    console.log('Error log');
    console.log(errorLogged);
    server.close(() => process.exit(1));
  });

}