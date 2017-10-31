let express = require('express');
let router = express.Router();
let passport = require('passport');

let userDB = require('../queries/users');

// Authentication and register methods
router.post('/login', userDB.login);
router.post('/register', userDB.createUser);
router.post('/logout', function(req, res, next){ req.logout() });

module.exports = router;
