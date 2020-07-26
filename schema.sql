DROP TABLE IF EXISTS savedTracker;

CREATE table savedTracker(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    city VARCHAR(255)
);

DROP TABLE IF EXISTS cities;

CREATE table cities(
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    lat VARCHAR(255),
    lon VARCHAR(255)
);
