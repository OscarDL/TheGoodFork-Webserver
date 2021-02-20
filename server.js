require('dotenv').config({path: './config.env'});

const express = require('express');
const https = require('https');
const fs = require('fs');

const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');


// app & db config
const port = process.env.PORT || 9000;
const app = express();
connectDB();


// middleware
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use('/api/auth', require('./routes/auth'));
app.use('/api/private', require('./routes/private'));

app.use(errorHandler); // needs to be last middleware used here


// api endpoints
app.get('/', (req, res) => res.status(200).send('WELCOME TO THE GOOD FORK!'));


// listener
const server = process.env.NODE_ENV === 'production'
  ?
app.listen(port, () => console.log('Listening on localhost:' + port))
  :
https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(port, () => console.log('Listening on localhost:' + port));

process.on('unhandledRejection', (error, promise) => {
  console.log('Logged Error: '+ error);
  server.close(() => process.exit(1));
});