const models = require('../models')
const dotenv = require("dotenv");
dotenv.config();
const axios = require('axios');
const FormData = require("form-data");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Users } = require('../models'); 
const jwt = require('jsonwebtoken');



exports.register = (req, res, next) => {
    (async() => {
        res.render('register', { message: '' }); 
    })();
};
exports.dashboard = (req, res, next) => {
    (async() => {
        const user = req.user;
        console.log('user>>>>>>>>',user)
            res.render('dashboard',user);
    })();
};

exports.login = (req, res, next) => {
    (async() => {
        const token = req.cookies; 
        if(token.authtoken){
                res.redirect("/dashboard");
        }else{
            res.render('login', { message: '' }); 
        }
    })();
};
exports.logout = (req, res, next) => {
    (async() => {
        res.clearCookie("authtoken");
        res.redirect("/login");
    })();
};

exports.userregister = async (req, res, next) => {
    (async() => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            const errors = [];
            return  res.status(400).json({ success: false, message: 'All fields are mandatory' });; 
           
        }

        const userAvailable = await Users.findOne({ where: { email } });
        console.log('userAvailable',userAvailable)
        if (userAvailable) {
            return res.status(400).json({ success: false, message: 'User Already exists' });;
        }

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        await Users.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(200).json({ success: true, message: 'Successfully Registered' });
       
    } catch (error) {
        console.error(error);
       return res.status(400).json({ success: false, message: 'Something went wrong Please try afer sometime' });
      
    }
})();
};


exports.loginuser = async (req, res, next) => {
    (async() => {
        const { email, password} = req.body;
        try {
        if(!email || !password){
            
            return res.status(400).render('login', { message: 'All fields are mandatory' });
        }
        const user = await Users.findOne({ where: { email: email } });
        console.log('user------------',user)
        if(user === null){
            return res.status(400).render('login', { message: 'Email is not valid. Please with the valid email.' });
        }else{
        // Load hash from your password DB.
            if(!bcrypt.compareSync(password, user.password)){ //`987T+GZS+
                
                return res.status(400).render('login', { message: 'Please check your password and try again.' });
            }
            const accessToken = jwt.sign({
                user:{
                    username: user.username,
                    id: user.id,
                    email: user.email
                }
            },process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: "5m" });
            
            
            res.cookie('authtoken', accessToken ,{ maxAge: 50000, httpOnly: true });
            res.redirect("/dashboard");
            
        }       
     }
        catch(error){
            console.error(error);
            return res.status(500).render('login', { message: 'Something went wrong. Please try again later.' });
        }
    })();
};
