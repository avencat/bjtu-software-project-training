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
        message: 'comment_id can not be null.'
      });

  } else {

    db.one('INSERT INTO comment_likes(user_id, comment_id, created, updated) ' +
      'values(${user_id}, ${comment_id}, ${created}, ${created}) ' +
      'RETURNING comment_likes.id AS comment_like_id',
      body)
      .then((response) => {

        res.status(201)
          .json({

            status: 'success',
            comment_like_id: response.comment_like_id,
            message: 'Inserted one like to comment ' + body.comment_id

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
              message: `Removed likeComment ${like_id}`

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

  if (req.query.comment_id) {

    const comment_id = parseInt(req.query.comment_id);

    db.any('SELECT comment_likes.id, comment_likes.user_id, comment_likes.comment_id, comment_likes.created, comment_likes.updated,' +
      'users.login, users.firstname, users.lastname ' +
      'FROM comment_likes INNER JOIN users ON comment_likes.user_id = users.id ' +
      'WHERE comment_likes.comment_id = $1',
      comment_id)

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
            message: 'Retrieved Likes of Comment'

          });

      })
      .catch(function (err) {

        return next(err);

      });

  } else {

    res.status(400)
      .json({

        status: 'error',
        message: 'comment_id not provided.'

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
