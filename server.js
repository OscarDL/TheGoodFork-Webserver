require('dotenv').config({path: './config.env'});

const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');


// app & db config
const port = process.env.PORT;
const app = express();
connectDB();


// middleware
var corsOpts = {
  origin: ['http://localhost:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
};

app.use(cors(corsOpts));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/private', require('./routes/private'));

app.use(errorHandler); // needs to be last middleware used here


// api endpoints
app.get('/', (req, res) => res.status(200).send('WELCOME TO THE GOOD FORK!'));


// listener
app.listen(port, () => console.log('Listening on localhost:' + port));

process.on('unhandledRejection', (error, _) => {
  console.log('Logged Error: '+ error);
  server.close(() => process.exit(1));
});