let { db } = require('../database');


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

    db.one('INSERT into friendships(following_id, follower_id, following_date, created, updated) ' +
      'values(${following_id}, ${follower_id}, ${following_date}, ${created}, ${created}) ' +
      'RETURNING friendships.id AS friendship_id',
      body)
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

      db.result('DELETE FROM friendships WHERE id = $1', friendship_id)
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

  db.oneOrNone('SELECT * FROM friendships WHERE id = $1', id)

    .then((data) => {

      return cb(null, data);

    })
    .catch((err) => {

      return cb(err, null);

    })

}

function getFriendships(req, res, next) {

  let request = 'SELECT friendships.id, friendships.following_id, friendships.follower_id, friendships.following_date, ' +
    'users.login, users.firstname, users.lastname ' +
    'FROM friendships INNER JOIN users ON friendships.following = users.id ' +
    'WHERE friendships.follower_id = $1';

  db.any(request + ' ORDER BY friendships.id DESC, friendships.following_date DESC', req.user.id)

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
          message: 'Retrieved posts'
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
      id: data.following_id,
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
