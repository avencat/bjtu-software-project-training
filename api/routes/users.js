let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/users');


/**
 * @api {delete} /users/:id Delete a User.
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {Number} id           User unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/users/" + user_id, {
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
 *       "message": "Deleted user 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteUser);

/**
 * @api {get} /users Request Users list.
 * @apiName GetUsers
 * @apiGroup User
 *
 * @apiParam {String} q   [Optional] Query string matching login, firstname or username of the users.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/users?q=" + some_query_string, {
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
 * @apiSuccess {Object} data        Content of the Users.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 42,
 *           "firstname": "m",
 *           "lastname": "lol",
 *           "login": "aze_90",
 *           "friendship_id": null
 *         },
 *         {
 *           "id": 43,
 *           "firstname": "n",
 *           "lastname": "lal",
 *           "login": "azerty_99",
 *           "friendship_id": 176,
 *         }
 *       ],
 *       "message": "Retrieved users"
 *     }
 *
 */
router.get('/', passport.authenticate('jwt', { session: false }), db.getUsers);

/**
 * @api {get} /users/:id Request specific User information.
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id User unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/users/" + user_id, {
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
 * @apiSuccess {String} status   Success status.
 * @apiSuccess {String} message  Success message.
 * @apiSuccess {Object} data     Content of the post.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "id": 42,
 *         "firstname": "m",
 *         "lastname": "lol",
 *         "login": "aze_90"
 *       },
 *       "message": "Retrieved user 42"
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "User not found"
 *     }
 */
router.get('/:id', passport.authenticate('jwt', { session: false }), db.getSingleUser);

router.post('/login', db.login);
router.post('/register', db.createUser);
router.post('/logout', function(req, res, next){ req.logout() });

router.put('/', passport.authenticate('jwt', { session: false }), db.updateUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateUser);


module.exports = router;
