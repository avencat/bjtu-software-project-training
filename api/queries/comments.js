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

function findCommentById(id, cb) {

  db.oneOrNone('SELECT * FROM comments WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getComments(req, res, next) {}

function updateComment(req, res, next) {

  const comment_id = parseInt(req.params.id);

  body = {
    content: req.body.content ? req.body.content : null
  };

  findCommentById(comment_id, (err, comment) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(comment.author_id) !== req.user.id) {

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

// Add query functions
module.exports = {
  createComment,
  deleteComment,
  findCommentById,
  getComments,
  updateComment
};
