'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const morgan = require('morgan');


const app = express();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
const GEOCODE = process.env.GEOCODE;
const NASA_KEY = process.env.NASA_KEY;
const WEATHER = process.env.WEATHER;

app.set('view engine', 'ejs');

app.use(cors());

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));

const client = new pg.Client(DATABASE_URL);

// ----------------------------------------------
// Route Definitions
// ----------------------------------------------

app.get('/', handleHome); //landing page
app.post('/basic', handleBasic); // basic user page
app.get('/basic/results', handleResults); //displays results after 'get iss passes button'
app.get('/aboutus', handleAboutUs); //about us page
app.get('/info', handleInfo); //info page
app.use('*', noFindHandler); // 404 route doesnt exist
app.use(errorHandler); //errors

// ----------------------------------------------
// Functions
// ----------------------------------------------

function saveLocation(obj) {

    const values = [obj.search_query, obj.formatted_query, obj.lat, obj.lon];

    const SQL = `
    INSERT INTO cities (search_query, formatted_query, lat, lon) VALUES ($1, $2, $3, $4) RETURNING *;`;
  
    client.query(SQL, values)
      .then(() => {
        console.log('This city has been saved');
      });
  }


// ----------------------------------------------
// Constructor Functions
// ----------------------------------------------
function Location (obj, query){
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.lat = obj.lat;
    this.lon = obj.lon;

}

//constructor function that takes in ISS Pass info
function Passes(obj){
    this.duration = Math.floor((obj.duration / 60));
    this.date = new Date(obj.risetime * 1000).toDateString();
    this.time = new Date(obj.risetime * 1000).toTimeString();
}

//constructor function that takes in Weather info
function Weather(obj){
    this.weatherIconURL = `https://www.weatherbit.io/static/img/icons/${obj.weather.icon}.png`
    this.description = obj.weather.description;
    this.temp = obj.temp;
    this.date = obj.valid_date;

}

//constructor function that takes in Astronanmy Pic of the Day info
function APOD(obj){
    this.copyright = obj.copyright;
    this.date = obj.date;
    this.title = obj.title;
    this.url = obj.url;
}

//constructor function that takes in ISS Location info
function ISSLocation(obj){
    this.lat = obj.iss_position.latitude;
    this.lon = obj.iss_position.longitude;
}

// ----------------------------------------------
// Route Functions
// ----------------------------------------------

function handleHome(req, res){
    res.render('pages/landingPage');
}

function handleBasic (req, res){
    let SQL = `INSERT INTO savedTracker (name, city) VALUES($1, $2) RETURNING *;`; //sql command that saves persons username and city they entered on the landing page

    let values= [req.body.name, req.body.city.toLowerCase()]; // stores username and city values that were entered

    client.query(SQL, values) //sends it to the DB
        .then( (results) => {
            console.log(results);
            res.render('pages/basicUser', {city: req.body.city, name: req.body.name});
        })
        .catch (error => {
            console.log('error from catch', error);
        });
}

function handleResults (req, res){

    // ----------------------------------------------
    // API URLs
    // ----------------------------------------------
    
    const API_apod = 'https://api.nasa.gov/planetary/apod';
    const API_issCurrentLocation = 'http://api.open-notify.org/iss-now.json';
    const API_Geocode ='https://us1.locationiq.com/v1/search.php';
    const API_weather = 'https://api.weatherbit.io/v2.0/forecast/daily'
    const API_issPasses = 'http://api.open-notify.org/iss-pass.json';
    
    // ----------------------------------------------
    // API query parameters
    // ----------------------------------------------

    let date = new Date();
    let dateOnly = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();  
    const cityParameters = {
        key:GEOCODE,
        q: req.query.city,
        format: 'json'
    };

    const weatherParameters = {
        city: req.query.city,
        days: 2,
        units: 'I',
        key: WEATHER
    };

    const nasaParameters = {
        api_key: NASA_KEY,
        date: dateOnly
    };
    
    // ----------------------------------------------
    // API Queries with parameters
    // ----------------------------------------------
    const api1 = superagent.get(API_apod).query(nasaParameters);
    const api2 = superagent.get(API_issCurrentLocation);
    const api3 = superagent.get(API_weather).query(weatherParameters);
    const api4 = superagent.get(API_Geocode).query(cityParameters);

    // The server will first check to see if the city is already saved in the DB

    const SQL = 'SELECT * from cities WHERE search_query = $1';
    const city = [req.query.city];

    client.query(SQL, city)
        .then(locations => {
            if(locations.rowCount){
                let cityData = locations.rows[0];
            
                Promise.all([api1, api2, api3])
                    .then(data => {
                        console.log('The database has this city!');
                        //run APOD data through Constructor
                        const astronamyPic = new APOD(data[0].body);

                        //run ISS Current Position data through Constructor
                        const issPosition = new ISSLocation(data[1].body);

                        //run weather data based on inputted city through Constructor
                        let weatherData = data[2].body.data.map(day => {
                            return new Weather(day);
                        });

                        //Now that we have location lat and lon (from cityData) we can run our query for ISS pass info

                        const passesParameters = {
                            lat: cityData.lat,
                            lon: cityData.lon,
                        };

                        superagent.get(API_issPasses)
                            .query(passesParameters)
                            .then(data => {
                                let passData = data.body.response.map(pass => {
                                    return new Passes(pass);
                                });
                                res.render('pages/results',{ pic:astronamyPic, issPosition:issPosition, location:cityData, weather: weatherData, issPasses: passData });
                            });
                    });

            }
            else{

                //If the city is not in the DB it will query the API

                console.log('This city is not in the Database');

                Promise.all([api1, api2, api3, api4])
                    .then(data => {

                        //run APOD data through Constructor
                        const astronamyPic = new APOD(data[0].body);

                        //run ISS Current Position data through Constructor
                        const issPosition = new ISSLocation(data[1].body);

                        //run weather data based on inputted city through Constructor
                        let weatherData = data[2].body.data.map(day => {
                            return new Weather(day);
                        });

                        //run Location data through Constructor
                        const cityData = new Location(data[3].body[0],req.query.city.toLowerCase());

                        saveLocation(cityData);

                        //Now that we have location lat and lon (from cityData) we can run our query for ISS pass info

                        const passesParameters = {
                            lat: cityData.lat,
                            lon: cityData.lon,
                        };

                        superagent.get(API_issPasses)
                            .query(passesParameters)
                            .then(data => {
                                let passData = data.body.response.map(pass => {
                                    return new Passes(pass);
                                });
                                res.render('pages/results',{ pic:astronamyPic, issPosition:issPosition, location:cityData, weather: weatherData, issPasses: passData });
                            });
                    });
            }
            
        });
}

function handleAboutUs (req, res){
    res.render('pages/aboutUs');
}

function handleInfo (req, res){
    res.render('pages/info');
}

function noFindHandler(req, res){
    res.status(404).send('Sorry, cannot find what you are looking for');
}
    
function errorHandler (err, req, res){
    res.status(500).send('Sorry, something went REALLY wrong', err);
}

client.connect(()=> {
    app.listen(PORT,()=>console.log(`Server is running on Port: ${PORT}`));
});