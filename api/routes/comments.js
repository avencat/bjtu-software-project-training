let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/comments');

/**
 * @api {get} /comments Request Comments list.
 * @apiName GetComments
 * @apiGroup Comment
 *
 * @apiParam {Number} post_id   [Optional] Post unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/comments?post_id=" + some_post_id, {
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
 * @apiSuccess {Object} data        Content of the Comments.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 1,
 *           "content": "Lorem ipsum...",
 *           "post_id": 1,
 *           "author_id": 1
 *         },
 *         {
 *           "id": 2,
 *           "content": "I love node",
 *           "post_id": 1,
 *           "author_id": 1
 *         }
 *       ],
 *       "message": "Retrieved posts"
 *     }
 *
 * @apiError CommentNotFound The id of the Comment was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "Comments not found"
 *     }
 */
router.get('/', passport.authenticate('jwt', { session: false }), db.getComments);

/**
 * @api {post} /comments Create a Comment.
 * @apiName CreateComment
 * @apiGroup Comment
 *
 * @apiParam {String} content      [Mandatory] Content of the Comment.
 * @apiParam {Number} post_id      [Mandatory] ID of the Post that will contain the comment.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/comments", {
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
 *        "content": "Lorem ipsum comment...",
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
 *       "message": "Inserted one comment to post 1"
 *     }
 */
router.post('/', passport.authenticate('jwt', { session: false }), db.createComment);

/**
 * @api {put} /comments/:id Update a Comment.
 * @apiName UpdateComment
 * @apiGroup Comment
 *
 * @apiParam {String} content      [Mandatory] New content of the Comment.
 * @apiParam {Number} id           [Mandatory] ID of the Comment.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/comments/" + some_comment_id, {
 *
 *      method: 'PUT',
 *
 *      headers: {
 *        'Accept': 'application/json',
 *        'Content-Type': 'application/json',
 *        'Authorization': 'Bearer ' + sessionStorage.getItem("userToken")
 *      },
 *
 *      body: JSON.stringify({
 *        "content": "Lorem ipsum comment updated..."
 *      })
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
 *       "message": "Updated comment 1"
 *     }
 */
router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateComment);

/**
 * @api {delete} /comments/:id Delete a Comment.
 * @apiName DeleteComment
 * @apiGroup Comment
 *
 * @apiParam {Number} id           [Mandatory] ID of the Comment.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/comments/" + some_comment_id, {
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
 *       "message": "Deleted comment 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteComment);


module.exports = router;
