const createError = require('http-errors');
const express = require('express');
const path = require('node:path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { connectDb } = require('./config/db');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const networkRouter = require('./routes/network');
const somaRouter = require('./routes/somaBeta');
const neuronsRouter = require('./routes/neurons');
const synapsesRouter = require('./routes/synapses');

const app = express();
app.disable("x-powered-by");

// Start Mongo connection once and reuse across invocations (Vercel cold starts)
const dbReady = connectDb();

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    next(err);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/network', networkRouter);
app.use('/soma/beta', somaRouter);
app.use('/soma', somaRouter);
app.use('/neurons', neuronsRouter);
app.use('/synapses', synapsesRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

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
