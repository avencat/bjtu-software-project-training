let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/likeComments');

router.get('/likeComments', passport.authenticate('jwt', { session: false }), db.getLikeComments);
router.post('/likeComments', passport.authenticate('jwt', { session: false }), db.createLikeComment);
router.delete('/likeComments/:id', passport.authenticate('jwt', { session: false }), db.deleteLikeComment);

module.exports = router;
