let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/likes');

/**
 * @api {get} /likes Request likes list.
 * @apiName GetLikes
 * @apiGroup Like
 *
 * @apiParam {Number} post_id   [Mandatory] Post unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likes?post_id=" + some_post_id, {
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
 * @apiSuccess {Object} data        Content of the Likes.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 1,
 *           "post_id": 1,
 *           "user_id": 1
 *         },
 *         {
 *           "id": 2,
 *           "post_id": 1,
 *           "user_id": 2
 *         }
 *       ],
 *       "message": "Retrieved likes"
 *     }
 *
 * @apiError CommentNotFound The id of the Like was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "Likes not found"
 *     }
 */
router.get('/', passport.authenticate('jwt', { session: false }), db.getLikes);

/**
 * @api {post} /likes Create a Like.
 * @apiName CreateLike
 * @apiGroup Like
 *
 * @apiParam {Number} post_id      [Mandatory] ID of the Post to like.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likes", {
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
 *        "post_id": 1
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
 *       "like_id": 1,
 *       "message": "Inserted one like to post 1"
 *     }
 */
router.post('/', passport.authenticate('jwt', { session: false }), db.createLike);

/**
 * @api {delete} /likes/:id Delete a Like.
 * @apiName DeleteLike
 * @apiGroup Like
 *
 * @apiParam {Number} id           [Mandatory] ID of the Like.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likes/" + some_like_id, {
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
 * @apiSuccess {String} status   Success status.
 * @apiSuccess {String} message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "message": "Deleted like 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);


module.exports = router;
