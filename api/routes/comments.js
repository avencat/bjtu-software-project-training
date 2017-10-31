let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/comments');

router.get('/comments', passport.authenticate('jwt', { session: false }), db.getComments);

router.post('/comments', passport.authenticate('jwt', { session: false }), db.createComment);

router.put('/comments/:id', passport.authenticate('jwt', { session: false }), db.updateComment);

router.delete('/comments/:id', passport.authenticate('jwt', { session: false }), db.deleteComment);

module.exports = router;
