'use strict';

const express = require('express');
require('dotenv').config();
const app = express();
require('ejs');

const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

app.use(express.static('./public'));

//  parser
app.use(express.urlencoded());

//  routes
app.post('/contact', collectInfo);

function collectInfo(request, response){
  console.log('/contact', collectInfo);
  response.send(request.body);
}

app.use('*', (request, response) => {
  response.status(404).send('page not found');
});

//  route
app.get('/', (request, response) => {
  response.render('index.ejs');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
