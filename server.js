'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const morgan = require('morgan');



// const client = new pg.Client(process.env.DATABASE_URL);

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
// app.get('/info', handleInfo); //info page
app.use('*', noFindHandler); // 404 route doesnt exist
app.use(errorHandler); //errors


// ----------------------------------------------
// Route Functions
// ----------------------------------------------

function handleHome(req, res){
    res.render('landingPage');
}

function handleBasic (req, res){
    let SQL = `INSERT INTO savedTracker (name, city) VALUES ($1, $2) RETURNING *`; //sql command that saves persons username and city they entered on thelanding page

    let values= [req.body.name, req.body.city]; // stores username and city values that were entered

    client.query(SQL, values) //sends it to the DB
        .then( results => {
            console.log(results);
        });
}



function handleResults (req, res){
    const API_Geocode ='https://us1.locationiq.com/v1/search.php';

    const cityParameters = {
      key:GEOCODE,
      q: city,
      format: 'json',
    };

    superagent.get(API_Geocode)
        .query(cityParameters)
        .then( data => {
            let cityData = new Location(data[0],city);
        });

    const API_issPasses = 'http://api.open-notify.org/iss-pass.json';

    const API_issCurrentLocation = 'http://api.open-notify.org/iss-now.json';


    superagent.get(API_issCurrentLocation)
        .then(data => {
            issPosition = {
                lat: data.iss_position.latitude,
                long: data.iss_position.longitude
            }
            
        });
}

function Location (obj, query){
    this.search_query = query;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

function handleAboutUs (req, res){
    res.render('aboutUs');
}

function handleInfo (req, res){
    res.render('info');
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