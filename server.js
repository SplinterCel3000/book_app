'use strict';

const express = require('express');
const app = express();

require('ejs');
require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');


const PORT = process.env.PORT || 3001;

client.on('error', (error) => console.log(error));

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded());
app.post('/searches', getBookInfo);

//  ROUTES

app.get('/', getBooks);

app.get('/new-book', getForm);

app.get('/books/detail', getOneBook);


//  GET ONE BOOK DETAILS and SHOW

function getOneBook(request, response) {
  let id = request.params.book_id;
  let sql = 'SELECT * FROM books WHERE id = $1;';
  let safeValues = [id];
  client.query(sql, safeValues)
    .then(results => {
      // let chosenBook = results.rows[0];
      response.render('pages/books/detail', {bookInfo:results.rows[0]});
    })
  // go to the database, get a specific book using the id of that book and show the details of that book on the detail.ejs page
}

// function showBooks(request, response){
//   // display a form to add a task
//   response.render('pages/addTask.ejs');
// }


//  NEW BOOK CALL

function getForm(request, response) {
  response.render('./pages/new-book');
}

//  BOOK.SQL CALL

function getBooks(request, response) {
  let sql = 'SELECT * FROM books;';

  client.query(sql)
    .then(results => {
      response.render('./pages/index', {arrayOfBooks:results.rows, numBooks:results.rows.length});
    })
    .catch( (error) => console.log(error));
}

//  API CALL BELOW

function getBookInfo(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  let typeOfSearch = request.body.search[1];
  let searchCriteria = request.body.search[0];
  if (typeOfSearch === 'author') {
    url += `+inauthor:${searchCriteria}`;
  }
  //items[0].volumeInfo.title
  if (typeOfSearch === 'title') {
    url += `+intitle:${searchCriteria}`;
  }
  superagent.get(url)
    .then(res => {
      let bookArray = res.body.items.map(book => {
        return new Book(book)
      });
        // console.log(bookArray);
      response.render('searches/show', {bookArray:bookArray});
    })
    // eslint-disable-next-line no-unused-vars
    .catch(error => {
      response.render('pages/error')
    })
}

function linkClean(url) {
  let prefix = 'https:';
  if (url.substr(0, 6) !== 'https:') {
    url = prefix + url.substr(url.search('//'), url.length);
    return url;
  } else {
    return url;
  }
}

function Book(bookObj) {
  let placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg(13 kB)';
  this.title = bookObj.volumeInfo.title || 'no title available';
  this.author = bookObj.volumeInfo.authors[0] || 'no author available';
  // this.url = bookObj.selfLink
  this.url = linkClean(bookObj.selfLink);
  this.image = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.smallThumbnail ? bookObj.volumeInfo.imageLinks.smallThumbnail : placeholderImage;
}

app.use('*', (request, response) => {
  response.status(404).send('page not found');
});

client.connect( () => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
