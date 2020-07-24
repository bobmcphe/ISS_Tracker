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
    this.duration = obj.response[0].duration;
    this.risetime = obj.response[0].risetime;
}

function Weather(obj){

}

function APOD(obj){
    this.copyright = obj.copyright;
    this.date = obj.date;
    this.title = obj.title;
    this.url = obj.hdurl;
}

// ----------------------------------------------
// Route Functions
// ----------------------------------------------

function handleHome(req, res){
    res.render('pages/landingPage');
}

function handleBasic (req, res){
    console.log('in handleBasic');
    let SQL = `INSERT INTO savedTracker (name, city) VALUES($1, $2) RETURNING *;`; //sql command that saves persons username and city they entered on the landing page

    let values= [req.body.name, req.body.city]; // stores username and city values that were entered

    client.query(SQL, values) //sends it to the DB
        .then( () => {
            res.render('pages/basicUser', {city: req.body.city});
        })
        .catch (error => {
            console.log('error from catch', error);
        });
}

function handleResults (req, res){

    // ----------------------------------------------
    // API URLs
    // ----------------------------------------------
    const API_Geocode ='https://us1.locationiq.com/v1/search.php';
    const API_issPasses = 'http://api.open-notify.org/iss-pass.json';
    const API_issCurrentLocation = 'http://api.open-notify.org/iss-now.json';
    const API_weather = 'https://api.weatherbit.io/v2.0/current'
    const API_apod = 'https://api.nasa.gov/planetary/apod';

    // ----------------------------------------------
    // API query parameters
    // ----------------------------------------------
    const cityParameters = {
        key:GEOCODE,
        q: req.query.city,
        format: 'json'
      };

    const weatherParameters = {
        city: req.query.city,
        key: WEATHER
    };

    const nasaParameters = {
        key: NASA_KEY
    };

    // ----------------------------------------------
    // API Queries with parameters
    // ----------------------------------------------
    const api1 = superagent.get(API_apod).query(nasaParameters);
    const api2 = superagent.get(API_issCurrentLocation);
    const api3 = superagent.get(API_Geocode).query(cityParameters);
    const api4 = superagent.get(API_weather).query(weatherParameters);
    const api5 = superagent.get(API_issPasses).query(passesParameters);


    Promise.all([api1, api2, api3, api4])
      .then( data => {
        const issPosition = {
            lat: data[1].body.iss_position.latitude,
            long: data[1].body.iss_position.longitude
        };  
        const cityData = new Location(data[2].body[0],req.query.city);
        
        let passData = new Passes(data[1].body);
        // 
        
      })
    
    //***************************************************************/
    // const API_Geocode ='https://us1.locationiq.com/v1/search.php';

    // const cityParameters = {
    //   key:GEOCODE,
    //   q: req.query.city,
    //   format: 'json',
    // };

    // superagent.get(API_Geocode)
    //     .query(cityParameters)
    //     .then( data => {
    //         let cityData = new Location(data.body[0],req.query.city);
    //         const API_issPasses = 'http://api.open-notify.org/iss-pass.json';
        
    //         const passesParameters = {
    //             lat: cityData.lat,
    //             lon: cityData.lon,
    //           };
        
    //         superagent.get(API_issPasses)
    //           .query(passesParameters)
    //           .then( data => {
    //               console.log('return data', data.body);
    //             let passData = new Passes(data.body);
    //             console.log('passData', passData);
    //           })
    //     });


    // const API_issCurrentLocation = 'http://api.open-notify.org/iss-now.json';


    // superagent.get(API_issCurrentLocation)
    //     .then(data => {
    //         issPosition = {
    //             lat: data.iss_position.latitude,
    //             long: data.iss_position.longitude
    //         }
            
    //     });
    // res.render('pages/results');
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