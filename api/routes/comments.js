let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/comments');

router.get('/', passport.authenticate('jwt', { session: false }), db.getComments);

router.post('/', passport.authenticate('jwt', { session: false }), db.createComment);

router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateComment);

router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteComment);

module.exports = router;
