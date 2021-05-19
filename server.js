require('dotenv').config({path: './config.env'});

const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const RateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');


// app & db config
const port = process.env.PORT;
const app = express();
connectDB();


// middleware
const rateLimiter = new RateLimit({
  windowMs: 300000, // 5 minutes
  max: 100 // 100 requests max
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

app.use('/api/v1', rateLimiter);
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/dishes', require('./routes/dishes'));
app.use('/api/v1/orders', require('./routes/orders'));
app.use('/api/v1/stripe', require('./routes/stripe'));
app.use('/api/v1/bookings', require('./routes/bookings'));

app.use(errorHandler); // needs to be last middleware used here


// api endpoints
app.get('/', (req, res) => res.status(200).send('Welcome to The Good Fork!'));


// listener
const server = app.listen(port, () => console.log('Listening on port ' + port));

process.on('unhandledRejection', (error, _) => {
  console.log('Logged Error: '+ error);
  server.close(() => process.exit(1));
});