let { db } = require('../database');
import format from 'pg-format';


function createComment(req, res, next) {

  const now = new Date();

  body = {
    content: req.body.content ? req.body.content : null,
    post_id: req.body.post_id,
    author_id: req.user.id,
    created: now
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

    db.one(format('INSERT into comments(author_id, post_id, content, likes_nb, created, updated)' +
      'values(%1$L, %2$L, %3$L, 0, %4$L, %4$L) ' +
      'RETURNING comments.id AS comment_id',
      body.author_id, body.post_id, body.content, body.created))
      .then((response) => {

        res.status(201)
          .json({

            status: 'success',
            comment_id: response.comment_id,
            message: 'Inserted one comment from user ' + body.author_id + ' to post ' + body.post_id

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

    } else if (!req.user || parseInt(comment.author_id) !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this comment.'
        });

    } else {

      db.result(format('DELETE FROM comments WHERE id = %L', comment_id))
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

function findCommentById(id, cb) {

  db.oneOrNone(format('SELECT * FROM comments WHERE id = %L', id))

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getComment(req, res, next) {

  const comment_id = parseInt(req.params.id);

  if (comment_id) {

    db.any(format('SELECT comments.id, comments.content, comments.author_id, comments.likes_nb, comments.post_id, comments.created, comments.updated, ' +
      'users.login, users.firstname, users.lastname ' +
      'FROM comments INNER JOIN users ON comments.author_id = users.id ' +
      'WHERE comments.id = %L',
      comment_id))

      .then((data) => {

        if (Array.isArray(data)) {

          return (serializeComments(data));

        } else {

          return (serializeComment(data));

        }

      })
      .then((data) => {

        res.status(200)
          .json({

            status: 'success',
            data,
            message: 'Retrieved comment'

          });

      })
      .catch(function (err) {

        return next(err);

      });

  } else {

    res.status(400)
      .json({

        status: 'error',
        message: 'id not provided.'

      });

  }
}

function getComments(req, res, next) {

  if (req.query.post_id) {

    const post_id = parseInt(req.query.post_id);

    db.any(format('SELECT comments.id, comments.content, comments.author_id, comments.likes_nb, comments.post_id, comments.created, comments.updated, ' +
      'users.login, users.firstname, users.lastname ' +
      'FROM comments INNER JOIN users ON comments.author_id = users.id ' +
      'WHERE comments.post_id = %L ' +
      'ORDER BY comments.created ASC',
      post_id))

      .then((data) => {

        if (Array.isArray(data)) {

          return (serializeComments(data));

        } else {

          return (serializeComment(data));

        }

      })
      .then((data) => {

        res.status(200)
          .json({

            status: 'success',
            data,
            message: 'Retrieved comments'

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

function serializeComments(data) {

  let newData = [];

  for (let i = 0, len = data.length; i < len; i++) {

    newData.push(serializeComment(data[i]));

  }

  return (newData);

}

function serializeComment(data) {

  return ({
    id: data.id,
    content: data.content,
    post_id: data.post_id,
    likes_nb: data.likes_nb,
    created: data.created,
    updated: data.updated,
    user: {
      id: data.author_id,
      login: data.login,
      firstname: data.firstname,
      lastname: data.lastname
    }
  });

}

function updateComment(req, res, next) {

  const comment_id = parseInt(req.params.id);
  const now = new Date();

  let content = req.body.content ? req.body.content : null;

  findCommentById(comment_id, (err, comment) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(comment.author_id) !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this comment.'
        });

    } else if (!content) {

      res.status(400)
        .json({
          status: 'error',
          message: 'content can not be null.'
        });

    } else {

      db.none(format('UPDATE comments SET content=COALESCE(%1$L, content), updated=%2$L WHERE id=%3$L',
        content, now, comment_id))
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

// Add query functions
module.exports = {
  createComment,
  deleteComment,
  findCommentById,
  getComments,
  getComment,
  updateComment,
  serializeComment,
  serializeComments
};
