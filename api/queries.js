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
function createUser(req, res, next) {}
function deleteComment(req, res, next) {}
function deleteFriendship(req, res, next) {}
function deleteLike(req, res, next) {}
function deleteLikeComment(req, res, next) {}
function deletePost(req, res, next) {}
function deleteUser(req, res, next) {}
function getAllPosts(req, res, next) {}
function getComments(req, res, next) {}
function getFriendships(req, res, next) {}
function getSinglePost(req, res, next) {}

function getUserPosts(req, res, next) {}

function getSingleUser(req, res, next) {

  const userId = parseInt(req.params.id);

  db.one('select id, firstname, lastname, birthday, email, gender, telephone from users where id = $1', userId)
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
