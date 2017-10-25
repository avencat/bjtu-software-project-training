let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let bodyParser = require('body-parser');
let session = require('express-session');
let cookieParser = require('cookie-parser');

let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
let DigestStrategy = require('passport-http').DigestStrategy;
let db = require('./queries');

passport.use(new DigestStrategy(
  {
    usernameField: 'login',
    qop: 'auth'
  },

  function(username, done) {

    db.findUserByLogin(username, function(err, user) {

      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user, user.password);

    });

  },

  function(params, done) {
    // validate nonces as necessary
    done(null, true)
  }
));

passport.use(new LocalStrategy(
  {
    usernameField: 'login',
  },

  function(username, password, done) {

    db.findUserByLogin(username, function(err, user) {

      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user);

    });
  })
);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.findUserById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Use session
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'db3bfc5f-6a56-4157-b198-7f4f7ce59831',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('db3bfc5f-6a56-4157-b198-7f4f7ce59831'));
app.use(express.static(path.join(__dirname, 'public')));

let index = require('./routes/index');
let users = require('./routes/users');

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message
  });
});

module.exports = app;
