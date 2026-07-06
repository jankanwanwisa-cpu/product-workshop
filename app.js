var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();
require('./db.js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');



var app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    status: 404,
    message: "Not Found: ไม่พบเส้นทางที่เรียกใช้งาน",
    data: null
  });
});
global.sendResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data
  });
};
// error handler
app.use(function(err, req, res, next) {
  console.error("Server Error:", err.stack);
  
  const statusCode = err.status || 500;
  const errorMessage = req.app.get('env') === 'development' ? err.message : "Internal Server Error";
  
  // เรียกใช้ sendResponse ที่เราทำขึ้นมาส่งกลับหน้าบ้านสวยๆ
  sendResponse(res, statusCode, errorMessage, []);
});

module.exports = app;
