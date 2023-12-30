var express = require('express');
var router = express.Router();
const {dashboard , register ,login ,userregister ,loginuser ,logout , profile ,saveprofile} = require('../controller/userController')
const checkAuthUser = require('../middleware/validateToken');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});
router.get('/forgot-password', function(req, res, next) {
  res.render('forgot-password');
});

router.route('/dashboard').get(checkAuthUser, dashboard);
router.route('/profile').get(checkAuthUser, profile).post(saveprofile);
router.route('/register').get(register).post(userregister);
router.route('/login').get(login).post(loginuser);

router.get('/logout',logout);

module.exports = router;
