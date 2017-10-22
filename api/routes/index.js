let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/login',
  passport.authenticate('local', { failureRedirect: '/api/login' }),
  function(req, res) {
    res.status(200)
      .json({
        status: 'success',
        message: 'User connected'
      });
  });

router.get('/api/my_secret_page', db.loggedIn, function (req, res) {
  res.send('if you are viewing this page it means you are logged in');
});

router.get('/api/logout',
  function(req, res){
    req.logout();
    res.redirect('/api/login');
  }
);

router.get('/api', db.getAllPosts);
router.get('/api/users', db.getUsers);
router.get('/api/user/:id', db.getSingleUser);
router.get('/api/user/:id/posts', db.getUserPosts);
router.get('/api/user/:id/friendships', db.getFriendships);
router.get('/api/post/:id/comments', db.getComments);
router.get('/api/post/:id', db.getSinglePost);
router.post('/api/user', db.createUser);
router.post('/api/post/:id/comment', db.createComment);
router.post('/api/friendship', db.createFriendship);
router.post('/api/post/:id/like', db.createLike);
router.post('/api/post', db.createPost);
router.post('/api/comment/:id/like', db.createLikeComment);
router.put('api/comment/:id', db.updateComment);
router.put('api/post/:id', db.updatePost);
router.put('api/user/:id', db.updateUser);
router.delete('/api/user/:id', db.deleteUser);
router.delete('/api/post/:id', db.deletePost);
router.delete('/api/comment/:id', db.deleteComment);
router.delete('/api/friendship/:id', db.deleteFriendship);
router.delete('/api/like/:id', db.deleteLike);
router.delete('/api/likeComment/:id', db.deleteLike);


module.exports = router;