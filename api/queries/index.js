let { db } = require('../database');


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

function getAllPosts(req, res, next) {}

function getComments(req, res, next) {}
function getFriendships(req, res, next) {}
function getLikes(req, res, next) {}
function getSinglePost(req, res, next) {}

function getUserPosts(req, res, next) {}

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

// Add query functions
module.exports = {
  createComment,
  createFriendship,
  createLike,
  createLikeComment,
  createPost,
  deleteComment,
  deleteFriendship,
  deleteLike,
  deleteLikeComment,
  deletePost,
  findCommentById,
  findCommentLikeById,
  findLikeById,
  findPostById,
  getAllPosts,
  getComments,
  getFriendships,
  getLikes,
  getSinglePost,
  getUserPosts,
  updateComment,
  updatePost
};
