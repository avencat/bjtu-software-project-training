let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/friendships');

/**
 * @api {get} /friendships Request Friendships of the current logged in user list.
 * @apiName GetFrienships
 * @apiGroup Friendship
 *
 * @apiParam {Number} following_id   [Optional] Followed User unique ID (Primary key).
 *
 * @apiExample {js} Fetch example in order to get all friendships of the current logged user:
 *   fetch("http://localhost:3001/friendships", {
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
 * @apiExample {js} Fetch example 2 in order to get a friendships of a specific user with the current logged in user:
 *   fetch("http://localhost:3001/friendships?following_id=" + some_user_id, {
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
 * @apiSuccess {Object} data        Content of the Friendships.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 1,
 *           "following_id": 42,
 *           "follower_id": 1,
 *           "following_date": date,
 *           "user": {
 *             "user_id": 42,
 *             "login": "aze_90",
 *             "firstname": "m",
 *             "lastname": "lol"
 *           }
 *         },
 *         {
 *           "id": 1,
 *           "following_id": 42,
 *           "follower_id": 2,
 *           "following_date": date,
 *           "user": {
 *             "user_id": 42,
 *             "login": "aze_90",
 *             "firstname": "m",
 *             "lastname": "lol"
 *           }
 *         }
 *       ],
 *       "message": "Retrieved posts"
 *     }
 *
 *
 * @apiError PostNotFound The id of the Post was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "Posts not found"
 *     }
 */
router.get('/', passport.authenticate('jwt', { session: false }), db.getFriendships);

/**
 * @api {post} /friendships Create a Friendship.
 * @apiName CreateFriendship
 * @apiGroup Friendship
 *
 * @apiParam {String} following_id      [Mandatory] Friendship unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/friendships", {
 *
 *      method: 'POST',
 *
 *      headers: {
 *        'Accept': 'application/json',
 *        'Content-Type': 'application/json',
 *        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
 *      },
 *
 *      body: JSON.stringify({
 *        "following_id": user_to_follow_id
 *      })
 *
 *    })
 *
 * @apiSuccess {String} status   Success status.
 * @apiSuccess {String} message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "status": "success",
 *       "friendship_id": 1,
 *       "message": "Inserted one friendship from user 1 to user 2"
 *     }
 */
router.post('/', passport.authenticate('jwt', { session: false }), db.createFriendship);

router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateFriendships);

/**
 * @api {delete} /friendships/:id Delete a Friendship.
 * @apiName DeleteFriendship
 * @apiGroup Friendship
 *
 * @apiParam {Number} id           [Mandatory] Friendship unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/friendships/" + friendship_id, {
 *
 *      method: 'DELETE',
 *
 *      headers: {
 *        'Accept': 'application/json',
 *        'Content-Type': 'application/json',
 *        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
 *      }
 *
 *    })
 *
 * @apiSuccess {String} status   success status.
 * @apiSuccess {String} message  success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Deleted friendship 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteFriendship);


module.exports = router;
