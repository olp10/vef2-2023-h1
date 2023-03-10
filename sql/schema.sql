CREATE TABLE users (
  id SERIAL UNIQUE PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  isAdmin BOOLEAN DEFAULT false
);

CREATE TABLE public.recipes (
  id SERIAL PRIMARY KEY,
  name character varying(128) NOT NULL,
  description character varying(512) NOT NULL,
  instructions character varying(2048) NOT NULL,
  ingredients character varying(512) NOT NULL
);

CREATE TABLE public.ingredients (
  id SERIAL PRIMARY KEY,
  name character varying(128) NOT NULL,
  quantity character varying(128) NOT NULL,
  unit character varying(128) NOT NULL,
  recipe_id integer REFERENCES recipes(id)
);

CREATE TABLE public.reviews (
  id SERIAL PRIMARY KEY,
  user_id integer REFERENCES users(id),
  recipe_id integer REFERENCES recipes(id),
  rating integer NOT NULL,
  comment character varying(512) NOT NULL
);