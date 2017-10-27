let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'SocialNetwork' });
});

/* GET login page. */
router.get('/api/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

/* GET register page. */
router.get('/api/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/api/login', db.login);

router.get('/api/my_secret_page', passport.authenticate('jwt', { session: false }), function (req, res) {
  res.send('if you are viewing this page it means you are logged in');
});

router.get('/api/logout',
  function(req, res){
    req.logout();
    res.redirect('/api/login');
  }
);

router.get('/api', passport.authenticate('jwt', { session: false }), db.getAllPosts);
router.get('/api/users', passport.authenticate('jwt', { session: false }), db.getUsers);
router.get('/api/user/:id', passport.authenticate('jwt', { session: false }), db.getSingleUser);
router.get('/api/user/:id/posts', passport.authenticate('jwt', { session: false }), db.getUserPosts);
router.get('/api/user/:id/friendships', passport.authenticate('jwt', { session: false }), db.getFriendships);
router.get('/api/post/:id/comments', passport.authenticate('jwt', { session: false }), db.getComments);
router.get('/api/post/:id', passport.authenticate('jwt', { session: false }), db.getSinglePost);
router.post('/api/register', db.createUser);
router.post('/api/post/:id/comment', passport.authenticate('jwt', { session: false }), db.createComment);
router.post('/api/friendship', passport.authenticate('jwt', { session: false }), db.createFriendship);
router.post('/api/post/:id/like', passport.authenticate('jwt', { session: false }), db.createLike);
router.post('/api/post', passport.authenticate('jwt', { session: false }), db.createPost);
router.post('/api/comment/:id/like', passport.authenticate('jwt', { session: false }), db.createLikeComment);
router.put('api/comment/:id', passport.authenticate('jwt', { session: false }), db.updateComment);
router.put('api/post/:id', passport.authenticate('jwt', { session: false }), db.updatePost);
router.put('api/user/:id', passport.authenticate('jwt', { session: false }), db.updateUser);
router.delete('/api/user/:id', passport.authenticate('jwt', { session: false }), db.deleteUser);
router.delete('/api/post/:id', passport.authenticate('jwt', { session: false }), db.deletePost);
router.delete('/api/comment/:id', passport.authenticate('jwt', { session: false }), db.deleteComment);
router.delete('/api/friendship/:id', passport.authenticate('jwt', { session: false }), db.deleteFriendship);
router.delete('/api/like/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);
router.delete('/api/likeComment/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);


module.exports = router;
