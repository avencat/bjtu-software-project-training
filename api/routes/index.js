let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/index');
let userDB = require('../queries/users');

router.get('/friendships', passport.authenticate('jwt', { session: false }), db.getFriendships);
router.get('/comments', passport.authenticate('jwt', { session: false }), db.getComments);
router.get('/likes', passport.authenticate('jwt', { session: false }), db.getLikes);
router.post('/likes', passport.authenticate('jwt', { session: false }), db.createLike);
router.post('/friendships', passport.authenticate('jwt', { session: false }), db.createFriendship);
router.post('/comments', passport.authenticate('jwt', { session: false }), db.createComment);
router.post('/comments/:id/like', passport.authenticate('jwt', { session: false }), db.createLikeComment);
router.put('/comments/:id', passport.authenticate('jwt', { session: false }), db.updateComment);
router.delete('/comments/:id', passport.authenticate('jwt', { session: false }), db.deleteComment);
router.delete('/friendships/:id', passport.authenticate('jwt', { session: false }), db.deleteFriendship);
router.delete('/likes/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);
router.delete('/likeComments/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);

// Authentication and register methods
router.post('/login', userDB.login);
router.post('/register', userDB.createUser);
router.post('/logout', function(req, res, next){ req.logout() });

module.exports = router;
