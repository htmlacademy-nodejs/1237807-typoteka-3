DROP TABLE IF EXISTS users cascade;
DROP TABLE IF EXISTS categories cascade;
DROP TABLE IF EXISTS articles cascade;
DROP TABLE IF EXISTS comments cascade;
DROP TABLE IF EXISTS article_categories;

CREATE TABLE users(
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email varchar(250) UNIQUE NOT NULL,
  password_hash varchar(250) NOT NULL,
  first_name varchar(250) NOT NULL,
  last_name varchar(250) NOT NULL,
  avatar varchar(50) NOT NULL
);

CREATE TABLE categories(
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(255) NOT NULL
);

CREATE TABLE articles(
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title varchar(250) NOT NULL,
  announce varchar(250) NOT NULL,
  full_text varchar(1000),
  image varchar(50),
  user_id integer NOT NULL,
  created_at timestamp DEFAULT current_timestamp,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE article_categories(
  article_id integer NOT NULL,
  category_id integer NOT NULL,
  PRIMARY KEY (article_id, category_id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
   		ON DELETE CASCADE
		  ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE CASCADE
		  ON UPDATE CASCADE
);

CREATE TABLE comments(
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id integer NOT NULL,
  article_id integer NOT NULL,
  text text NOT NULL,
  created_at timestamp DEFAULT current_timestamp,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (article_id) REFERENCES articles(id)
);

CREATE INDEX ON articles (title);