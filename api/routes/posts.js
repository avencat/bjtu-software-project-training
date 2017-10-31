let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/posts');


router.get('/', passport.authenticate('jwt', { session: false }), db.getAllPosts);
router.get('/:id', passport.authenticate('jwt', { session: false }), db.getSinglePost);

router.post('/', passport.authenticate('jwt', { session: false }), db.createPost);

router.put('/:id', passport.authenticate('jwt', { session: false }), db.updatePost);

router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deletePost);


module.exports = router;
