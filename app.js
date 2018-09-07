var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ejs = require('ejs')
var favicon = require('serve-favicon');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goods = require('./routes/goods');
var topic = require('./routes/topic');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req,res,next) {
  if(req.cookies.userName){
    next();
  }else {
    if(req.originalUrl == '/api/users/login' || req.originalUrl == '/api/users/logout' || req.originalUrl.indexOf('/api/goods/list')>-1 || req.originalUrl == '/api/users/register' || req.originalUrl.indexOf('/api/goods/searchGoods')>-1 ){
      next()
    }else {
      res.json({
        status:'10001',
        msg:'当前未登录',
        result:''
      })
    }
  }
});

app.use('/api/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/goods',goods);
app.use('/api/topic',topic);

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
  res.render('error');
});

module.exports = app;
