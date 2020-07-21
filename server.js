'use strict';

require('dotenv').config();

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');
const morgan = require('morgan');
const { response } = require('express');



// const client = new pg.Client(process.env.DATABASE_URL);

const app = express();

const PORT = process.env.PORT;

app.set('view engine', 'ejs');

app.use(cors());

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static('./public'));

// ----------------------------------------------
// Route Definitions
// ----------------------------------------------

app.get('/', (req, res) => {
    res.send('this is working');   
});


app.listen(PORT, () => console.log(`Server is really really running on port ${PORT}`) );

