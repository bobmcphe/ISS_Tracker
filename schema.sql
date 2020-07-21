DROP TABLE IF EXISTS savedTracker;

CREATE table savedTracker(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    lat VARCHAR(255),
    lon VARCHAR(255)
);