var express = require('express');
var router = express.Router();
const {dashboard , register ,login ,userregister ,loginuser ,logout} = require('../controller/userController')
const checkAuthUser = require('../middleware/validateToken');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login');
});
router.get('/forgot-password', function(req, res, next) {
  res.render('forgot-password');
});

router.route('/dashboard').get(checkAuthUser, dashboard);
router.get('/register',register);
router.get('/logout',logout);
router.get('/login',login);
router.post('/register',userregister);
router.post('/login',loginuser);

module.exports = router;
