
DROP TABLE books;

CREATE TABLE IF NOT EXISTS books (
id SERIAL PRIMARY KEY,
author VARCHAR(255),
title VARCHAR(255),
isbn VARCHAR(20),
url TEXT,
image_url TEXT,
description TEXT,
bookshelf VARCHAR(255)
);
