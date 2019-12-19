'use strict';

const express = require('express');
const app = express();

require('ejs');
require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');
const methodOverride = require('method-override');

const PORT = process.env.PORT || 3001;

client.on('error', (error) => console.log(error));

app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded());
app.use(methodOverride('_method'));
app.post('/searches', getBookInfo);
app.post('/add', addBook);
app.put('/update/:book_id', updateBook);

// :book.id stuff TO DO

//  ROUTES

app.get('/', getBooks); // index.ejs

app.get('/new-book', getForm); // new-book.ejs

app.get('/books/:book_id', getOneBook);


//  GET ONE BOOK DETAILS and SHOW

function getOneBook(request, response) {
  let id = request.params.book_id;
  let sql = 'SELECT * FROM books WHERE id = $1;';
  let safeValues = [id];
  client.query(sql, safeValues)
    .then(results => {
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

// ADD BOOK FUNCTION

function addBook(request, response) {
  let { author, title, isbn, url, image_url, description, bookshelf } = request.body;
  let sql = 'INSERT INTO books (author, title, isbn, url, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6, $7);';
  let safeValues = [author, title, isbn, url, image_url, description, bookshelf];
  client.query(sql, safeValues);
  response.redirect('/');
}

//  UPDATE BOOK FUNCTION

function updateBook(request, response) {
  let { author, title, isbn, url, image_url, description, bookshelf } = request.body;
  let sql = 'UPDATE books SET author=$1, title=$2, isbn=$3, url=$4, image_url=$5, description=$6, bookshelf=$7';
  // let id = request.params.book_id;
  let safeValues = [author, title, isbn, url, image_url, description, bookshelf];
  client.query(sql, safeValues);
  response.redirect('/');
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
      response.render('pages/searches/show-search', {bookArray:bookArray});
    })
    // eslint-disable-next-line no-unused-vars
    .catch(error => {
      console.log('new error', error);
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
  this.url = linkClean(bookObj.selfLink);
  this.image_url = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.smallThumbnail ? bookObj.volumeInfo.imageLinks.smallThumbnail : placeholderImage;
  this.description = bookObj.volumeInfo.description;
  this.isbn = bookObj.volumeInfo.industryIdentifiers[0].identifier;
  // this.bookshelf = '';
}

app.use('*', (request, response) => {
  response.status(404).send('page not found');
});

client.connect( () => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
