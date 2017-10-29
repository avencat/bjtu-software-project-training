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
let BasicStrategy = require('passport-http').BasicStrategy;
let db = require('./queries');
let bcrypt = require('bcryptjs');

// JWT
let passportJWT = require("passport-jwt");
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;


let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = '25015c61-030e-452f-a92f-5b8cdb0b627e';

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {

  // usually this would be a database call:
  db.findUserById(jwt_payload.id, (err, user) => {

    if (err) {

      res.status(500).json(err);

    } else if (user) {

      next(null, user);

    } else {

      next(null, false);

    }

  });

}));

passport.use(new BasicStrategy(
  {
    usernameField: 'login'
  },

  function(username, password, done) {

    db.findUserByLogin(username, function(err, user) {

      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user);

    });

  }
));

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

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, OPTIONS");
  next();
});

app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//if (process.env.NODE_ENV !== 'test')
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
