DROP TABLE IF EXISTS savedTracker;

CREATE table savedTracker(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    city VARCHAR(255)
);