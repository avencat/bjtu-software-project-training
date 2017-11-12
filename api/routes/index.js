let express = require('express');
let router = express.Router();
let passport = require('passport');

let userDB = require('../queries/users');
let indexDB = require('../queries/index');

// Authentication and register methods
router.post('/login', userDB.login);
router.post('/register', userDB.createUser);
router.post('/logout', function(req, res, next){ req.logout() });


// Helpers
/**
 * @api {get} /followerNb Request number of followers of a user.
 * @apiName GetFollowerNb
 * @apiGroup Friendship
 *
 * @apiParam {Number} user_id   [Mandatory] User unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/followerNb?user_id=" + some_user_id, {
 *
 *      method: 'GET',
 *
 *      headers: {
 *        'Accept': 'application/json',
 *        'Content-Type': 'application/json',
 *        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
 *      }
 *
 *    })
 *
 *
 * @apiSuccess {String} status      Success status.
 * @apiSuccess {String} message     Success message.
 * @apiSuccess {Object} data        Number of users that follow you.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": 198,
 *       "message": "Retrieved number of users that follow you"
 *     }
 *
 */
router.get('/followerNb', passport.authenticate('jwt', { session: false }), indexDB.getFollowerNb);


/**
 * @api {get} /followingNb Request number of user that a specific user is following.
 * @apiName GetFollowingNb
 * @apiGroup Friendship
 *
 * @apiParam {Number} user_id   [Mandatory] User unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/followingNb?user_id=" + some_user_id, {
 *
 *      method: 'GET',
 *
 *      headers: {
 *        'Accept': 'application/json',
 *        'Content-Type': 'application/json',
 *        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
 *      }
 *
 *    })
 *
 *
 * @apiSuccess {String} status      Success status.
 * @apiSuccess {String} message     Success message.
 * @apiSuccess {Object} data        Number of users you follow.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": 198,
 *       "message": "Retrieved number of users you are following"
 *     }
 *
 */
router.get('/followingNb', passport.authenticate('jwt', { session: false }), indexDB.getFollowingNb);


module.exports = router;
