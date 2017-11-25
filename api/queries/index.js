let { db } = require('../database');
let format = require('pg-format');


function getFollowingNb(req, res, next) {

  const user_id = (req.query.user_id || req.query.author_id) ? parseInt(req.query.user_id | req.query.author_id) : req.user.id;

  db.one(format('SELECT COUNT(id) FROM friendships WHERE follower_id = %L', user_id))

    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data: data.count,
          message: 'Retrieved number of users that follow user ' + user_id
        });

    })
    .catch(function (err) {

      return next(err);

    });

}

function getFollowerNb(req, res, next) {

  const user_id = (req.query.user_id || req.query.author_id) ? parseInt(req.query.user_id | req.query.author_id) : req.user.id;

  db.one(format('SELECT COUNT(id) FROM friendships WHERE following_id = %L', user_id))

    .then((data) => {

      res.status(200)
        .json({
          status: 'success',
          data: data.count,
          message: 'Retrieved number of users that user ' + user_id + ' is following'
        });

    })
    .catch(function (err) {

      return next(err);

    });

}

// Add query functions
module.exports = {
  getFollowingNb,
  getFollowerNb
};