let { db } = require('../database');


function createLike(req, res, next) {

  const now = new Date();

  body = {
    post_id: req.body.post_id,
    user_id: req.user.id,
    created: now
  };


  if (!body.post_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'post_id can not be null.'
      });

  } else {

    db.none('INSERT into post_likes(user_id, post_id, created, updated)' +
      'values(${user_id}, ${post_id}, ${created}, ${created})',
      body)
      .then(() => {

        res.status(201)
          .json({

            status: 'success',
            message: 'Inserted one like from user ' + body.user_id + ' to post ' + body.post_id

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

    } else if (!req.user || parseInt(like.user_id) !== req.user.id) {

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

function findLikeById(id, cb) {

  db.oneOrNone('SELECT * FROM post_likes WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getLikes(req, res, next) {

  if (req.query.post_id) {

    const post_id = parseInt(req.query.post_id);

    db.any('SELECT post_likes.id, post_likes.user_id, post_likes.post_id, post_likes.created, post_likes.updated, ' +
      'users.login, users.firstname, users.lastname ' +
      'FROM post_likes INNER JOIN users ON post_likes.user_id = users.id ' +
      'WHERE post_likes.post_id = $1',
      post_id)

      .then((data) => {

        if (Array.isArray(data)) {

          return (serializeLikes(data));

        } else {

          return (serializeLike(data));

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

function serializeLikes(data) {

  let newData = [];

  for (let i = 0, len = data.length; i < len; i++) {

    newData.push(serializeLike(data[i]));

  }

  return (newData);

}

function serializeLike(data) {

  return ({
    id: data.id,
    post_id: data.post_id,
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
  createLike,
  deleteLike,
  findLikeById,
  getLikes
};
