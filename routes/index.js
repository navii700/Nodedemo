var express = require('express');
var router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const { id } = req.body;
    const fileName = id + '-' + file.originalname;
    cb(null, fileName);
  },
});
const tempstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    cb(null, 'public/uploads/temp');
  },
  filename: (req, file, cb) => {
    const { id } = req.body;
    const fileName = id + '-' + file.originalname;
    cb(null, fileName);
  },
});


const upload = multer({ storage: storage });
const tempupload = multer({ storage: tempstorage });

const {dashboard , register ,login ,userregister ,loginuser ,logout , profile ,saveprofile , saveprofilepic , deleteprofilepic ,addmember, deletemember , updatemember , getmembers} = require('../controller/userController')
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
router.post('/delete-member',deletemember);
router.post('/add-member',addmember);
router.post('/delete-pic',deleteprofilepic);
router.post('/update-member',updatemember);
router.route('/save-profile-pic').post( upload.single('file'),saveprofilepic);
router.route('/save-profile-pic-temp').post( tempupload.single('file'));

router.get('/getmembers',getmembers);



module.exports = router;
