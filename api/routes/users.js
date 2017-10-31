let express = require('express');
let router = express.Router();
let passport = require('passport');

let db = require('../queries/users');


router.delete('/:id', passport.authenticate('jwt', { session: false }), db.deleteUser);

router.get('/', passport.authenticate('jwt', { session: false }), db.getSingleUser);
router.get('/:id', passport.authenticate('jwt', { session: false }), db.getSingleUser);
router.get('/all', passport.authenticate('jwt', { session: false }), db.getUsers);

router.post('/login', db.login);
router.post('/register', db.createUser);

router.put('/', passport.authenticate('jwt', { session: false }), db.updateUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), db.updateUser);


module.exports = router;
