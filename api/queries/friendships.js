let { db } = require('../database');
let format = require('pg-format');


function createFriendship(req, res, next) {

  const now = new Date();

  body = {
    following_id: req.body.following_id,
    follower_id: req.user.id,
    following_date: now,
    created: now,
    updated: now
  };


  if (!body.following_id) {

    res.status(400)
      .json({
        status: 'error',
        message: 'following_id can not be null.'
      });

  } else {

    db.one(format('INSERT into friendships(following_id, follower_id, following_date, created, updated) ' +
      'values(%1$L, %2$L, %3$L, %4$L, %4$L) ' +
      'RETURNING friendships.id AS friendship_id',
      body.following_id, body.follower_id, body.following_date, body.created))
      .then((response) => {

        res.status(201)
          .json({

            status: 'success',
            friendship_id: response.friendship_id,
            message: 'Inserted one friendship from user ' + body.follower_id + ' to user ' + body.following_id

          });

      })
      .catch(function (err) {

        return next(err);

      });

  }
}

function deleteFriendship(req, res, next) {

  const friendship_id = parseInt(req.params.id);

  findFriendshipById(friendship_id, (err, friendship) => {

    if (err) {

      next(err);

    } else if (!req.user || parseInt(friendship.follower_id) !== req.user.id) {

      res.status(403)
        .json({
          status: 'error',
          message: 'You are not authorized to delete this friendship.'
        });

    } else {

      db.result(format('DELETE FROM friendships WHERE id = %L', friendship_id))
        .then(function (result) {
          /* jshint ignore:start */
          res.status(200)
            .json({
              status: 'success',
              message: `Removed friendship ${friendship_id}`
            });
          /* jshint ignore:end */
        })
        .catch(function (err) {
          return next(err);
        });

    }

  });
}

function findFriendshipById(id, cb) {

  db.oneOrNone(format('SELECT * FROM friendships WHERE id = %L', id))

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getFriendships(req, res, next) {

  const user_id = parseInt((req.query.user_id || req.query.author_id) ? (req.query.user_id | req.query.author_id) : req.user.id);

  let request = 'SELECT friendships.id, friendships.following_id, friendships.follower_id, friendships.following_date, ' +
    'users.login, users.firstname, users.lastname, users.id AS user_id ' +
    'FROM friendships INNER JOIN users ON';

  if (req.query.followers && req.query.followers === 'true') {

    request = format(request + ' friendships.follower_id = users.id WHERE friendships.following_id = %L', user_id);

    if (req.query.follower_id) {

      request = format(request + ' AND friendships.follower_id = %L', req.query.follower_id)

    }

  } else {

    request = format(request + ' friendships.following_id = users.id WHERE friendships.follower_id = %L', user_id);

    if (req.query.following_id) {

      request = format(request + ' AND friendships.following_id = %L', req.query.following_id)

    }

  }

  request = format(request + ' ORDER BY friendships.id DESC, friendships.following_date DESC');

  db.any(request)

    .then((data) => {

      if (Array.isArray(data)) {

        return (serializeFriendships(data));

      } else {

        return (serializeFriendship(data));

      }

    })
    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data,
          message: 'Retrieved friendships'
        });

    })
    .catch(function (err) {

      return next(err);

    });
}

function serializeFriendships(data) {

  let newData = [];

  for (let i = 0, len = data.length; i < len; i++) {

    newData.push(serializeFriendship(data[i]));

  }

  return (newData);

}

function serializeFriendship(data) {

  return ({
    id: data.id,
    following_id: data.following_id,
    follower_id: data.follower_id,
    following_date: data.following_date,
    user: {
      id: data.user_id,
      login: data.login,
      firstname: data.firstname,
      lastname: data.lastname
    }
  });

}

function updateFriendships(req, res, next) {
  res.status(400)
    .json({
      status: 'error',
      message: 'Not implemented.'
    });
}

// Add query functions
module.exports = {
  createFriendship,
  deleteFriendship,
  getFriendships,
  updateFriendships
};
