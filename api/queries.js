let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let { db } = require('./database');

let jwtSecretOrKey = '25015c61-030e-452f-a92f-5b8cdb0b627e';


function createComment(req, res, next) {

  body = {
    content: req.body.content ? req.body.content : null,
    post_id: req.body.post_id,
    author_id: req.user.id
  };

  if (!body.content) {

    res.status(400)
      .json({
        status: 'error',
        message: 'content can not be null.'
      });

  } else if (!body.post_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'post_id can not be null.'
      });

  } else {

    db.none('INSERT into comments(author_id, post_id, content, likes_nb)' +
      'values(${author_id}, ${post_id}, ${content}, 0)',
      body)
      .then(() => {

        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one comment from user ' + body.author_id + ' to post ' + body.post_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

function createFriendship(req, res, next) {}

function createLike(req, res, next) {

  body = {
    post_id: req.body.post_id,
    user_id: req.user.id
  };


  if (!body.post_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'post_id can not be null.'
      });

  } else {

    db.none('INSERT into post_likes(user_id, post_id)' +
      'values(${user_id}, ${post_id})',
      body)
      .then(() => {

        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one like from user ' + body.author_id + ' to post ' + body.post_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

function createLikeComment(req, res, next) {

  body = {
    comment_id: req.body.comment_id,
    user_id: req.user.id
  };


  if (!body.comment_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'post_id can not be null.'
      });

  } else {

    db.none('INSERT into comment_likes(user_id, comment_id)' +
      'values(${user_id}, ${comment_id})',
      body)
      .then(() => {

        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one like from user ' + body.author_id + ' to comment ' + body.comment_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

function createPost(req, res, next) {

  body = {
    content: req.body.content ? req.body.content : null,
    author_id: req.user.id
  };

  if (!body.content) {

    res.status(400)
      .json({
        status: 'error',
        message: 'content can not be null.'
      });

  } else {

    db.none('INSERT into posts(author_id, content, comments_nb, likes_nb)' +
      'values(${author_id}, ${content}, 0, 0)',
      body)
      .then(() => {

        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one post for user ' + body.author_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

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

    body.password = bcrypt.hashSync(body.password, 10);

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

function deleteComment(req, res, next) {

  const comment_id = parseInt(req.params.id);

  findCommentById(comment_id, (err, comment) => {

    if (err) {

      next(err);

    } else if (!req.user || comment.author_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this comment.'
        });

    } else {

      db.result('DELETE FROM comments WHERE id = $1', comment_id)
        .then(function (result) {
          /* jshint ignore:start */
          res.status(200)
            .json({
              status: 'success',
              message: `Removed comment ${comment_id}`
            });
          /* jshint ignore:end */
        })
        .catch(function (err) {
          return next(err);
        });

    }

  });

}

function deleteFriendship(req, res, next) {}

function deleteLike(req, res, next) {

  const like_id = parseInt(req.params.id);

  findLikeById(like_id, (err, like) => {

    if (err) {

      next(err);

    } else if (!req.user || like.user_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this like.'
        });

    } else {

      db.result('DELETE FROM post_likes WHERE id = $1', like_id)
        .then(function (result) {

          /* jshint ignore:start */
          res.status(200)
            .json({

              status: 'success',
              message: `Removed like ${like_id}`

            });
          /* jshint ignore:end */

        })
        .catch(function (err) {

          return next(err);

        });

    }

  });

}

function deleteLikeComment(req, res, next) {

  const like_id = parseInt(req.params.id);

  findCommentLikeById(like_id, (err, like) => {

    if (err) {

      next(err);

    } else if (!req.user || like.user_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this like.'
        });

    } else {

      db.result('DELETE FROM comment_likes WHERE id = $1', like_id)
        .then(function (result) {

          /* jshint ignore:start */
          res.status(200)
            .json({

              status: 'success',
              message: `Removed like ${like_id}`

            });
          /* jshint ignore:end */

        })
        .catch(function (err) {

          return next(err);

        });

    }

  });

}

function deletePost(req, res, next) {

  const post_id = parseInt(req.params.id);

  findPostById(post_id, (err, post) => {

    if (err) {

      next(err);

    } else if (!req.user || post.author_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this post.'
        });

    } else {

      db.result('DELETE FROM likes WHERE id = $1', post_id)
        .then(function (result) {

          /* jshint ignore:start */
          res.status(200)
            .json({

              status: 'success',
              message: `Removed post ${post_id}`

            });
          /* jshint ignore:end */

        })
        .catch(function (err) {

          return next(err);

        });

    }

  });

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

function findCommentById(id, cb) {

  db.oneOrNone('SELECT * FROM comments WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function findLikeById(id, cb) {

  db.oneOrNone('SELECT * FROM post_likes WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function findCommentLikeById(id, cb) {

  db.oneOrNone('SELECT * FROM comment_likes WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function findPostById(id, cb) {

  db.oneOrNone('SELECT * FROM posts WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

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

function getAllPosts(req, res, next) {}

function getComments(req, res, next) {}
function getFriendships(req, res, next) {}
function getSinglePost(req, res, next) {}

function getUserPosts(req, res, next) {}

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
          userId: user.id
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

function updateComment(req, res, next) {

  const comment_id = parseInt(req.params.id);

  body = {
    content: req.body.content ? req.body.content : null
  };

  findCommentById(comment_id, (err, comment) => {

    if (err) {

      next(err);

    } else if (!req.user || comment.author_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this comment.'
        });

    } else if (!body.content) {

      res.status(400)
        .json({
          status: 'error',
          message: 'content can not be null.'
        });

    } else {

      db.none('UPDATE comments SET content=COALESCE($1, content) WHERE id=$2',
        [body.content, comment_id])
        .then(() => {

          res.status(200)
            .json({

              status: 'success',
              message: 'Updated comment ' + comment_id

            });

        })
        .catch(function (err) {

          return next(err);

        });

    }

  });

}

function updatePost(req, res, next) {

  const post_id = parseInt(req.params.id);

  body = {
    content: req.body.content ? req.body.content : null
  };

  findPostById(post_id, (err, post) => {

    if (err) {

      next(err);

    } else if (!req.user || post.author_id !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this comment.'
        });

    } else if (!body.content) {

      res.status(400)
        .json({
          status: 'error',
          message: 'content can not be null.'
        });

    } else {

      db.none('UPDATE posts SET content=COALESCE($1, content) WHERE id=$2',
        [body.content, post_id])
        .then(() => {

          res.status(200)
            .json({

              status: 'success',
              message: 'Updated post ' + post_id

            });

        })
        .catch(function (err) {

          return next(err);

        });

    }

  });

}

function updateUser(req, res, next) {

  const login = /^[a-z0-9_]{5,}$/;

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

    db.none('UPDATE users SET firstname=COALESCE($1, firstname), lastname=COALESCE($2, lastname), birthday=COALESCE($3, birthday), login=COALESCE($4, login), gender=COALESCE($5, gender), telephone=COALESCE($6, telephone), password=COALESCE($7, password) WHERE id = $8',
      [body.firstname, body.lastname, body.birthday, body.login, body.gender, body.telephone, body.password, req.user.id])
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
  findCommentById,
  findCommentLikeById,
  findLikeById,
  findPostById,
  findUserByLogin,
  findUserById,
  getAllPosts,
  getComments,
  getFriendships,
  getSinglePost,
  getSingleUser,
  getUserPosts,
  getUsers,
  login,
  updateComment,
  updatePost,
  updateUser
};
