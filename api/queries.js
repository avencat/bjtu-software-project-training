let promise = require('bluebird');

let options = {
  // Initialization Options
  promiseLib: promise
};

let pgp = require('pg-promise')(options);
let connectionString = 'postgres://avencat:root@localhost:5432/socialnetwork';
let db = pgp(connectionString);

function createComment(req, res, next) {}
function createFriendship(req, res, next) {}
function createLike(req, res, next) {}
function createLikeComment(req, res, next) {}
function createPost(req, res, next) {}

function createUser(req, res, next) {

  const mail = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const login = /^[a-z0-9_]{5,}$/;

  body = {
    firstname: req.body.firstname ? req.body.firstname : null,
    lastname: req.body.lastname ? req.body.lastname : null,
    birthday: req.body.birthday ? req.body.birthday : null,
    email: req.body.email ? req.body.email.trim().toLowerCase() : null,
    login: req.body.login ? req.body.login.trim().toLowerCase() : null,
    gender: req.body.gender ? req.body.gender : null,
    telephone: req.body.telephone ? req.body.telephone : null,
    password: req.body.password ? req.body.password : null
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

    db.none('INSERT into users(firstname, lastname, birthday, email, login, gender, telephone, password)' +
      'values(${firstname}, ${lastname}, ${birthday}, ${email}, ${login}, ${gender}, ${telephone}, ${password})',
      body)
      .then(() => {
        res.status(201)
          .json({
            status: 'success',
            message: 'Inserted one user'
          });
      })
      .catch(function (err) {
        return next(err);
      });

  }

}

function deleteComment(req, res, next) {}
function deleteFriendship(req, res, next) {}
function deleteLike(req, res, next) {}
function deleteLikeComment(req, res, next) {}
function deletePost(req, res, next) {}

function deleteUser(req, res, next) {

  const userId = parseInt(req.params.id);

  if (!req.user || !userId || userId !== req.user.id) {

    res.status(403)
      .json({
        status: 'error',
        message: 'You are not authorized to delete this user.'
      });

  } else {

    db.result('DELETE FROM users WHERE id = $1', userId)
      .then(function (result) {
        /* jshint ignore:start */
        res.status(200)
          .json({
            status: 'success',
            message: `Removed ${result.rowCount} user`
          });
        /* jshint ignore:end */
      })
      .catch(function (err) {
        return next(err);
      });

  }

}

function findUserById(id, cb) {

  db.one('SELECT * FROM users WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(null, null);

    })

}

function findUserByLogin(username, cb) {

  db.one('SELECT * FROM users WHERE login = $1', username)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(null, null);

    })

}

function getAllPosts(req, res, next) {}
function getComments(req, res, next) {}
function getFriendships(req, res, next) {}
function getSinglePost(req, res, next) {}

function getUserPosts(req, res, next) {}

function getSingleUser(req, res, next) {

  const userId = parseInt(req.params.id);

  db.one('SELECT id, firstname, lastname, birthday, email, gender, telephone FROM users WHERE id = $1', userId)

    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE user'
        });

    })
    .catch(function (err) {

      return next(err);

    });
}

function getUsers(req, res, next) {

  db.any('SELECT id, firstname, lastname FROM users')

    .then(function (data) {

      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL users'
        });

    })
    .catch(function (err) {

      return next(err);

    });
}

function updateComment(req, res, next) {}
function updatePost(req, res, next) {}

function updateUser(req, res, next) {

  const login = /^[a-z0-9_]{6,}$/;

  body = {
    firstname: req.body.firstname ? req.body.firstname : null,
    lastname: req.body.lastname ? req.body.lastname : null,
    birthday: req.body.birthday ? req.body.birthday : null,
    login: req.body.login ? req.body.login.trim().toLowerCase() : null,
    gender: req.body.gender ? req.body.gender : null,
    telephone: req.body.telephone ? req.body.telephone : null,
    password: req.body.password ? req.body.password : null
  };

  if (body.password.length < 6) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Password should be at least 6 characters.'
      });

  } else if (!body.login || !login.test(body.login)) {

    res.status(400)
      .json({
        status: 'error',
        message: 'Login sould be at least 6 characters and use only a-z, 1-9 or _.'
      });

  } else {

    db.none('UPDATE users SET firstname=$1, lastname=$2, birthday=$3, login=$4, gender=$5, telephone=$6, password=$7 WHERE id = $8',
      [body.firstname, body.lastname, body.birthday, body.login, body.gender, body.telephone, body.password, req.user.id])
      .then(() => {
        res.status(201)
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
  createComment,
  createFriendship,
  createLike,
  createLikeComment,
  createPost,
  createUser,
  deleteComment,
  deleteFriendship,
  deleteLike,
  deleteLikeComment,
  deletePost,
  deleteUser,
  findUserByLogin,
  findUserById,
  getAllPosts,
  getComments,
  getFriendships,
  getSinglePost,
  getSingleUser,
  getUserPosts,
  getUsers,
  updateComment,
  updatePost,
  updateUser
};
