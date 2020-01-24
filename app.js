const express = require("express");
const cors = require("cors");
const compression = require('compression');
const fileUpload = require('express-fileupload');
const morgan = require('morgan')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//Connecting to Mongo
// mongoose.connect('mongodb://localhost:27017');
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log("MongoDB working")
// });

// Express instance
const app = express();

// Loggers
app.use(morgan('combined'));

// default options
app.use(fileUpload());

// Compression
app.use(compression());
// Allowing other fonts accesss
app.use(cors({ origin: true }));

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


const datap = require("./route/datapage");
app.use("/dp", datap);

const route = require("./route/main");
app.use("/api", route);

// In case doesn't found correct endpoint
app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

module.exports = app;