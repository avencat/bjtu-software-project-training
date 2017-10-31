let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/friendships');

router.get('/', passport.authenticate('jwt', { session: false }), db.getFriendships);

router.post('/', passport.authenticate('jwt', { session: false }), db.createFriendship);

router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateFriendships);

router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteFriendship);


module.exports = router;
