const { signIn, signUp, logout} = require('./auth.service.js');
const validateCredentials = require('./middleware/validateCredentials.js');


const router = require('express').Router();

router.post('/signup', validateCredentials, signUp);
router.post('/signin', validateCredentials, signIn);
router.get('/logout', logout);

module.exports = router;