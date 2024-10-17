var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
// Kết nối đến MongoDB
// const db = require('./config/db');

// // Connet
// db.connect();

const MONGO_URL = 'mongodb+srv://songhuy3042002:9LPcD7maKgsX@project1.t9dsa.mongodb.net/DEMO_LIST?retryWrites=true&w=majority&appName=project1'
mongoose.connect(MONGO_URL).then(() => {
  console.log("Database is connet")
})
const corsOptions = {
  origin:'*',
  credentials:true,
  optionSuccessStatus:200,

}

var app = express();
// Sử dụng middleware CORS
app.use(cors(corsOptions));
app.use(cors({ origin: 'http://localhost:5173' }));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static('public'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
//hostname:port/
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});





// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err.message)
});

module.exports = app;
