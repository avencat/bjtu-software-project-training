let { db } = require('../database');
let commentsQueries = require('./comments');
let format = require('pg-format');


function createPost(req, res, next) {

  const now = new Date();

  let body = {
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

    db.oneOrNone(format('INSERT INTO posts(author_id, content, comments_nb, likes_nb, created, updated) ' +
      'VALUES(%1$L, %2$L, 0, 0, %3$L, %3$L) ' +
      'RETURNING posts.id AS post_id',
      body.author_id, body.content, now))
      .then((response) => {

        res.status(201)
          .json({

            status: 'success',
            post_id: response.post_id,
            message: 'Inserted one post for user ' + body.author_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }

}

function deletePost(req, res, next) {

  const post_id = parseInt(req.params.id);

  findPostById(post_id, (err, post) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(post.author_id) !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this post.'
        });

    } else {

      db.result(format('DELETE FROM posts WHERE id = %L', post_id))
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

function findPostById(id, cb) {

  db.oneOrNone(format('SELECT * FROM posts WHERE id = %L', id))

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getAllCommentsForPost(id) {

  id = parseInt(id);

  return(db.any(format('SELECT comments.id, comments.content, comments.author_id, comments.likes_nb, comments.post_id, comments.created, comments.updated, ' +
    'users.login, users.firstname, users.lastname ' +
    'FROM comments INNER JOIN users ON comments.author_id = users.id ' +
    'WHERE comments.post_id = %L ' +
    'ORDER BY comments.created ASC',
    id))
    .then(data => {

      if (Array.isArray(data)) {

        return (commentsQueries.serializeComments(data));

      } else {

        return (commentsQueries.serializeComment(data));

      }

    }));
}

function getAllPostsWithComments(req, res, next) {

  let request = format('SELECT posts.id, posts.content, posts.author_id, posts.likes_nb, posts.comments_nb, posts.created, posts.updated, ' +
    'users.login, users.firstname, users.lastname ' +
    'FROM posts INNER JOIN users ON posts.author_id = users.id');

  if (req.query.author_id || req.query.user_id) {

    const user_id = parseInt(req.query.author_id || req.query.user_id);

    request = format(request + ' WHERE posts.author_id = %L', user_id);

  }

  db.any(format(request + ' ORDER BY posts.id DESC, posts.created DESC'))

    .then((data) => {

      if (Array.isArray(data)) {

        return (serializePosts(data, 'comments'));

      } else {

        getAllCommentsForPost(data.id, (comments) => {
          return (serializePost(data, comments));
        });

      }

    })
    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data,
          message: 'Retrieved posts with comments'
        });

    })
    .catch(function (err) {

      return next(err);

    });

}

function getAllPosts(req, res, next) {

  let request = 'SELECT posts.id, posts.content, posts.author_id, posts.likes_nb, posts.comments_nb, posts.created, posts.updated, ' +
    'users.login, users.firstname, users.lastname ' +
    'FROM posts INNER JOIN users ON posts.author_id = users.id ';

  if (req.query.author_id || req.query.user_id) {

    const following_id = parseInt(req.query.author_id || req.query.user_id);

    if (following_id === req.user.id) {
      request = format(request + 'WHERE posts.author_id = %L', req.user.id);
    } else {
      request = format(request + 'WHERE posts.author_id IN (SELECT following_id FROM friendships WHERE follower_id = %L AND following_id = %L)', req.user.id, following_id, req.user.id);
    }

  } else {

    request = format(request + 'WHERE posts.author_id IN (SELECT following_id FROM friendships WHERE follower_id = %L) OR posts.author_id = %L', req.user.id, req.user.id);

  }

  db.any(format(request + ' ORDER BY posts.created DESC, posts.id DESC'))

    .then((data) => {

      if (Array.isArray(data)) {
        return (serializePosts(data));
      } else {
        return (serializePost(data));
      }

    })
    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data,
          message: 'Retrieved posts'
        });

    })
    .catch(function (err) {

      return next(err);

    });

}

async function serializePosts(data, comments = null) {

  let newData = [];

  for (let i = 0, len = data.length; i < len; i++) {

    if (comments && data[i].comments_nb > 0) {

      let comments = await getAllCommentsForPost(data[i].id);

      newData.push(serializePost(data[i], comments));

    } else {

      newData.push(serializePost(data[i]));

    }

  }

  return (newData);

}

function serializePost(data, comments = null) {

  return ({
    id: data.id,
    content: data.content,
    likes_nb: data.likes_nb,
    comments_nb: data.comments_nb,
    created: data.created,
    updated: data.updated,
    comments,
    user: {
      id: data.author_id,
      login: data.login,
      firstname: data.firstname,
      lastname: data.lastname
    }
  });

}

function getSinglePost(req, res, next) {

  if (!req.params.id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'id not specified'
      });

  }

  const post_id = parseInt(req.params.id);

  db.one(format('SELECT posts.id, posts.content, posts.author_id, posts.likes_nb, posts.comments_nb, posts.created, posts.updated, ' +
    'users.login, users.firstname, users.lastname ' +
    'FROM posts INNER JOIN users ON posts.author_id = users.id ' +
    'WHERE posts.id = %L ' +
    'ORDER BY posts.id DESC, posts.created DESC',
    post_id))

    .then((data) => serializePost(data))
    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data,
          message: 'Retrieved one post'
        });

    })
    .catch(function (err) {

      return next(err);

    });

}

function updatePost(req, res, next) {

  const post_id = parseInt(req.params.id);
  const now = new Date();

  findPostById(post_id, (err, post) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(post.author_id) !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to update this comment.'
        });

    } else if (!req.body.content) {

      res.status(400)
        .json({
          status: 'error',
          message: 'content can not be null.'
        });

    } else {

      db.none(format('UPDATE posts SET content=COALESCE(%1$L, content), updated=%2$L WHERE id=%3$L',
        (req.body.content ? req.body.content : null), now, post_id))
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
  createPost,
  deletePost,
  findPostById,
  getAllPosts,
  getAllPostsWithComments,
  getSinglePost,
  updatePost
};
