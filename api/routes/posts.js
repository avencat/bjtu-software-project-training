let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/posts');


/**
 * @api {get} /posts Request Posts list.
 * @apiName GetPosts
 * @apiGroup Post
 *
 * @apiParam {Number} author_id   [Optional] Author unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/posts?author_id=" + some_user_id, {
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
 * @apiSuccess {Object} data        Content of the Posts.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": [
 *         {
 *           "id": 1,
 *           "content": "Lorem ipsum...",
 *           "author_id": 1
 *         },
 *         {
 *           "id": 2,
 *           "content": "I love node",
 *           "author_id": 1
 *         }
 *       ],
 *       "message": "Retrieved posts"
 *     }
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
router.get('/', passport.authenticate('jwt', { session: false }), db.getAllPosts);

/**
 * @api {get} /posts/:id Request specific Post information.
 * @apiName GetPost
 * @apiGroup Post
 *
 * @apiParam {Number} id Post unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/posts/" + post_id, {
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
 *         "id": 1,
 *         "content": "Lorem ipsum...",
 *         "author_id": 1,
 *       },
 *       "message": "Retrieved post 1"
 *     }
 *
 * @apiError PostNotFound The id of the Post was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "message": "Post not found"
 *     }
 */
router.get('/:id', passport.authenticate('jwt', { session: false }), db.getSinglePost);

/**
 * @api {post} /posts Create a Post.
 * @apiName CreatePost
 * @apiGroup Post
 *
 * @apiParam {String} content      [Mandatory] Content of the Post.
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/posts", {
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
 *        "content": "Lorem ipsum..."
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
 *       "message": "Inserted one post for user 1"
 *     }
 */
router.post('/', passport.authenticate('jwt', { session: false }), db.createPost);

/**
 * @api {put} /posts/:id Update a Post.
 * @apiName UpdatePost
 * @apiGroup Post
 *
 * @apiParam {String} content      [Mandatory] Content of the Post.
 * @apiParam {Number} id           Post unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/posts/" + post_id, {
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
 *        "content": "Lorem ipsum update..."
 *      })
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
 *       "message": "Updated post 1"
 *     }
 */
router.put('/:id', passport.authenticate('jwt', { session: false }), db.updatePost);

/**
 * @api {delete} /posts/:id Delete a Post.
 * @apiName DeletePost
 * @apiGroup Post
 *
 * @apiParam {String} content      Mandatory Content of the Post.
 * @apiParam {Number} id           Post unique ID (Primary key).
 *
 * @apiExample {js} Fetch example:
 *   fetch("http://localhost:3001/posts/" + post_id, {
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
 *       "message": "Deleted post 1"
 *     }
 */
router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deletePost);


module.exports = router;
