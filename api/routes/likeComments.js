let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/likeComments');

/**
 * @api {get} /likeComments Request Likes list on a comment.
 * @apiName GetLikeComments
 * @apiGroup LikeComment
 *
 * @apiParam {Number} comment_id   [Mandatory] Comment unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likeComments?comment_id=" + some_comment_id, {
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
 * @apiSuccess {Object} data        Content of the LikeComments.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 1,
 *           "comment_id": 1,
 *           "user_id": 1
 *         },
 *         {
 *           "id": 2,
 *           "comment_id": 1,
 *           "user_id": 2
 *         }
 *       ],
 *       "message": "Retrieved Likes of Comment"
 *     }
 *
 * @apiError CommentNotFound The id of the LikeComment was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "LikeComments not found"
 *     }
 */
router.get('/', passport.authenticate('jwt', { session: false }), db.getLikeComments);

/**
 * @api {post} /likeComments Create a Like on a Comment.
 * @apiName CreateLikeComment
 * @apiGroup LikeComment
 *
 * @apiParam {Number} comment_id      [Mandatory] ID of the Comment to like.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likeComments", {
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
 *        "comment_id": 1
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
 *       "comment_like_id": 1,
 *       "message": "Inserted one like to comment 1"
 *     }
 */
router.post('/', passport.authenticate('jwt', { session: false }), db.createLikeComment);

/**
 * @api {delete} /likeComments/:id Delete a Like on a Comment.
 * @apiName DeleteLikeComment
 * @apiGroup LikeComment
 *
 * @apiParam {Number} id           [Mandatory] ID of the LikeComment.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/likeCommentslikeComments/" + some_like_comment_id, {
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
 *       "message": "Deleted likeComment 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteLikeComment);

module.exports = router;
