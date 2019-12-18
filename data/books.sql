
DROP TABLE IF EXISTS books;

CREATE TABLE books (
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn NUMERIC,
image_url TEXT,
description TEXT,
bookshelf TEXT
);

INSERT INTO books (author, title, isbn, image_url, description, bookshelf) VALUES ('Into Thin Air', 'Jon Krakauer', 9780307475251, 'http://books.google.com/books/content?id=iTf5X22gChAC&printsec=frontcover&img=1&zoom=5&edge=curl&imgtk=AFLRE72m8PbtHVg4mzah1ZKcPwFR1m5rcU4rE3XP188rgEfWhs57hq5Rko4qfUlqkib9kQp2Q4CwmE0J2iDIjRDsMhvj2PoH_3D7WiuH5rZrWqOpLqCvrhB82ITZksZKlrQQm86SVOH-&source=gbs_api', 'test1 test2 test3', 'default');
