let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/index');
let userDB = require('../queries/users');

router.get('/likes', passport.authenticate('jwt', { session: false }), db.getLikes);
router.post('/likes', passport.authenticate('jwt', { session: false }), db.createLike);
router.post('/comments/:id/like', passport.authenticate('jwt', { session: false }), db.createLikeComment);
router.delete('/likes/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);
router.delete('/likeComments/:id', passport.authenticate('jwt', { session: false }), db.deleteLike);

// Authentication and register methods
router.post('/login', userDB.login);
router.post('/register', userDB.createUser);
router.post('/logout', function(req, res, next){ req.logout() });

module.exports = router;
