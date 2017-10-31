let { db } = require('../database');


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

function getLikes(req, res, next) {}

// Add query functions
module.exports = {
  createLike,
  createLikeComment,
  deleteLike,
  deleteLikeComment,
  findCommentLikeById,
  findLikeById,
  getLikes
};
