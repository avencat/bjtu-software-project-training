let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let format = require('pg-format');
let { db } = require('../database');

let jwtSecretOrKey = '25015c61-030e-452f-a92f-5b8cdb0b627e';


function createUser(req, res, next) {

  const mail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const login = /^[a-z0-9_]{5,}$/;
  const now = new Date();

  body = {
    firstname: req.body.firstname ? req.body.firstname : null,
    lastname: req.body.lastname ? req.body.lastname : null,
    birthday: req.body.birthday ? req.body.birthday : null,
    email: req.body.email ? req.body.email.trim().toLowerCase() : null,
    login: req.body.login ? req.body.login.trim().toLowerCase() : null,
    gender: req.body.gender ? req.body.gender : null,
    telephone: req.body.telephone ? req.body.telephone : null,
    password: req.body.password ? req.body.password : null,
    created: now
  };

  if (!body.password || body.password.length < 6) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Password should be at least 6 characters.'
      });

  } else if (!body.email || !mail.test(body.email)) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Bad email.'
      });

  } else if (!body.login || !login.test(body.login)) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Login sould be at least 5 characters and use only a-z, 1-9 or _.'
      });

  } else {

    body.password = bcrypt.hashSync(body.password, 10);

    db.none('INSERT into users(firstname, lastname, birthday, email, login, gender, telephone, password, created, updated)' +
      'values(${firstname}, ${lastname}, ${birthday}, ${email}, ${login}, ${gender}, ${telephone}, ${password}, ${created}, ${created})',
      body)
      .then(() => {
        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one user'

          });
      })
      .catch(function (err) {
        if (err.constraint === "users_email_key") {

          err.status = 400;
          err.message = "Email taken."

        } else if (err.constraint === "users_login_key") {

          err.status = 400;
          err.message = "Login taken."

        }
        return next(err);
      });

  }

}

function deleteUser(req, res, next) {

  const user_id = parseInt(req.params.id);

  if (!req.user || !user_id || user_id !== req.user.id) {

    res.status(403)
      .json({

        status: 'error',
        message: 'You are not authorized to delete this user.'

      });

  } else {

    db.result('DELETE FROM users WHERE id = $1', user_id)
      .then(function () {

        /* jshint ignore:start */
        res.status(200)
          .json({
            status: 'success',
            message: `Removed user ${user_id}`
          });
        /* jshint ignore:end */

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

function findUserById(id, cb) {

  db.oneOrNone('SELECT * FROM users WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function findUserByLogin(username, cb) {

  db.oneOrNone('SELECT * FROM users WHERE login = $1', username)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getSingleUser(req, res, next) {

  const userId = req.params.id ? parseInt(req.params.id) : req.user.id;

  db.one('SELECT id, login, firstname, lastname, birthday, email, gender, telephone FROM users WHERE id = $1', userId)

    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          user: data,
          message: 'Retrieved ONE user'
        });

    })
    .catch(function (err) {

      return next(err);

    });
}

function getUsers(req, res, next) {

  let query = 'SELECT id, firstname, lastname, login FROM users';

  if (req.query.q) {

    query = format(query + ' WHERE users.firstname LIKE %1$L OR users.lastname LIKE %1$L OR users.login LIKE %1$L', '%' + req.query.q + '%');

  }

  db.any(query)

    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved users'
        });

    })
    .catch(function (err) {

      return next(err);

    });
}

function login(req, res, next) {

  if (!req.body.login || !req.body.password) {

    res.status(400).json({
      status: 'error',
      message: 'Login and password needed.',
    });

  } else {

    findUserByLogin(req.body.login.trim().toLowerCase(), (err, user) => {

      if (err) {

        next(err);

      } else if (user && bcrypt.compareSync(req.body.password, user.password)) {

        const payload = {id: user.id};
        const token = jwt.sign(payload, jwtSecretOrKey);
        res.json({
          status: "success",
          message: "User successfully logged in.",
          token: token,
          user_id: user.id
        });

      } else {

        res.status(401).json({
          status: 'error',
          message: 'Incorrect username or password.',
        });

      }

    });


  }

}

function updateUser(req, res, next) {

  const login = /^[a-z0-9_]{5,}$/;
  const now = new Date();

  body = {
    firstname: req.body.firstname ? req.body.firstname : null,
    lastname: req.body.lastname ? req.body.lastname : null,
    birthday: req.body.birthday ? req.body.birthday : null,
    login: req.body.login ? req.body.login.trim().toLowerCase() : null,
    gender: req.body.gender ? req.body.gender : null,
    telephone: req.body.telephone ? req.body.telephone : null,
    password: req.body.password ? req.body.password : null
  };

  if (body.password && body.password.length < 6) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Password should be at least 6 characters.'
      });

  } else if (body.login && !login.test(body.login)) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Login should be at least 5 characters and use only a-z, 1-9 or _.'
      });

  } else {

    if (body.password)
      body.password = bcrypt.hashSync(body.password, 10);

    db.none('UPDATE users SET firstname=COALESCE($1, firstname), lastname=COALESCE($2, lastname), birthday=COALESCE($3, birthday), login=COALESCE($4, login), gender=COALESCE($5, gender), telephone=COALESCE($6, telephone), password=COALESCE($7, password), updated=$8 WHERE id = $9',
      [body.firstname, body.lastname, body.birthday, body.login, body.gender, body.telephone, body.password, now, req.user.id])
      .then(() => {
        res.status(200)
          .json({
            status: 'success',
            message: 'Updated one user'
          });
      })
      .catch(function (err) {
        return next(err);
      });

  }

}

// Add query functions
module.exports = {
  createUser,
  deleteUser,
  findUserById,
  findUserByLogin,
  getSingleUser,
  getUsers,
  login,
  updateUser
};
