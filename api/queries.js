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

  body = {
    firstname: null,
    lastname: null,
    birthday: null,
    email: null,
    login: null,
    gender: null,
    telephone: null,
    password: null
  };

  Object.assign(body, req.body);

  db.none('INSERT into users(firstname, lastname, birthday, email, login, gender, telephone, password)' +
    'values(${firstname}, ${lastname}, ${birthday}, ${email}, ${login}, ${gender}, ${telephone}, ${password})',
    body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one user'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function deleteComment(req, res, next) {}
function deleteFriendship(req, res, next) {}
function deleteLike(req, res, next) {}
function deleteLikeComment(req, res, next) {}
function deletePost(req, res, next) {}
function deleteUser(req, res, next) {}

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
function updateUser(req, res, next) {}

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/api/login');
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
  loggedIn,
  updateComment,
  updatePost,
  updateUser
};
