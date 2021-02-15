import express from 'express';

// app config
const app = express();
const port = 9000;

// middleware

// db config


// api endpoints
app.get('/', (req, res) =>  res.status(200).send('GOOD FORK!'));

// listener
app.listen(process.env.PORT || port, () => console.log('Listening on localhost:' + port));