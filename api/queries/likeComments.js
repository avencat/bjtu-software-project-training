let { db } = require('../database');


function createLikeComment(req, res, next) {

  const now = new Date();

  body = {
    comment_id: req.body.comment_id,
    user_id: req.user.id,
    created: now
  };


  if (!body.comment_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'post_id can not be null.'
      });

  } else {

    db.none('INSERT into comment_likes(user_id, comment_id, created, updated)' +
      'values(${user_id}, ${comment_id}, ${created}, ${created})',
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

function deleteLikeComment(req, res, next) {

  const like_id = parseInt(req.params.id);

  findLikeCommentsById(like_id, (err, like) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(like.user_id) !== req.user.id) {

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

function findLikeCommentsById(id, cb) {

  db.oneOrNone('SELECT * FROM comment_likes WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getLikeComments(req, res, next) {

  if (req.query.post_id) {

    const post_id = parseInt(req.query.post_id);

    db.any('SELECT comment_likes.id, comment_likes.user_id, comment_likes.post_id, comment_likes.created, comment_likes.updated, users.login, users.firstname, users.lastname FROM comment_likes INNER JOIN users ON comment_likes.user_id = users.id WHERE comment_likes.post_id = $1', post_id)

      .then((data) => {

        if (Array.isArray(data)) {

          return (serializeCommentLikes(data));

        } else {

          return (serializeCommentLike(data));

        }

      })
      .then((data) => {

        res.status(200)
          .json({

            status: 'success',
            data,
            message: 'Retrieved likes'

          });

      })
      .catch(function (err) {

        return next(err);

      });

  } else {

    res.status(400)
      .json({

        status: 'error',
        message: 'post_id not provided.'

      });

  }

}

function serializeCommentLikes(data) {

  let newData = [];

  for (let i = 0, len = data.length; i < len; i++) {

    newData.push(serializeCommentLike(data[i]));

  }

  return (newData);

}

function serializeCommentLike(data) {

  return ({
    id: data.id,
    comment_id: data.comment_id,
    created: data.created,
    updated: data.updated,
    user: {
      id: data.user_id,
      login: data.login,
      firstname: data.firstname,
      lastname: data.lastname
    }
  });

}

// Add query functions
module.exports = {
  createLikeComment,
  deleteLikeComment,
  findLikeCommentsById,
  getLikeComments
};
