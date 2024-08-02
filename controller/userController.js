
const models = require('../models')
const dotenv = require("dotenv");
dotenv.config();
const axios = require('axios');
const FormData = require("form-data");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Users,Members } = require('../models'); 
const jwt = require('jsonwebtoken');
const fs = require('fs');


exports.register = async(req, res, next) => {
    res.render('register', { message: '' }); 
};
exports.dashboard = async (req, res, next) => {
    try {
        const user = req.user;
        console.log('user----',user)
        const members =  await Members.findAll({ where: { user_id: user.id } })
        console.log('memebrs----',members)
        return res.render('dashboard',{user: user ,members: members } );
    } catch (error) {
        // console.error(error);
        return res.status(500).render('login', { message: 'Something went wrong. Please try again later.' });
    }
};


exports.login = async(req, res, next) => {
    const token = req.cookies; 
    if(token.authtoken){
        res.redirect("/dashboard");
    }else{
        res.render('login', { message: '' }); 
    }
};
exports.logout =async (req, res, next) => { 
    res.clearCookie("authtoken");
    res.redirect("/login"); 
};


exports.profile =async (req, res, next) => {
    const user = req.user;
    res.render('profile',{ user : user} );
};
exports.userregister = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).render('register', { message: 'All fields are mandatory' });
           
        }

        const userAvailable = await Users.findOne({ where: { email } });
        // console.log('userAvailable',userAvailable)
        if (userAvailable) {
            return res.status(400).render('register', { message: 'User Already exists' });
        }

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        await Users.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(400).render('register', { message: 'Successfully Registered'  });
       
    } catch (error) {
        console.error(error);
        return res.status(400).render('register', { message: 'Something went wrong Please try afer sometime'  });
    }
};


exports.loginuser = async (req, res, next) => {

    const { email, password} = req.body;
    try {
    if(!email || !password){
        return res.status(400).render('login', { message: 'All fields are mandatory' });
    }
    const user = await Users.findOne({ where: { email: email } });
    // console.log('user------------',user)
    if(user === null){
        return res.status(400).render('login', { message: 'Email is not valid. Please with the valid email.' });
    }else{
    // Load hash from your password DB.
        if(!bcrypt.compareSync(password, user.password)){ //`987T+GZS+
            
            return res.status(400).render('login', { message: 'Please check your password and try again.' });
        }
        user.message ="";
        const accessToken = jwt.sign({
            user : user 
        },process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "600000m" });
        
    //    let token = generatetoken(res,accessToken);
        res.cookie('authtoken', accessToken ,{ maxAge: 6000000, httpOnly: true }).redirect("/dashboard");
        
    }       
    }
    catch(error){
        console.error(error);
        return res.status(500).render('login', { message: 'Something went wrong. Please try again later.' });
    }
    
};
exports.saveprofile = async (req, res, next) => {
    const { email, id ,name ,bio ,phonenumber } = req.body; 
    
    // console.log('user email',email);
    if(id){
      await Users.update({
            username: name,
            email : email,
            bio : bio,
            phone_number : phonenumber
        },{
            where: {
                id: id
            }
        });  
        const user = await Users.findOne({ where: { email } });
        
        const accessToken = jwt.sign({
            user: user ,
        },process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "60m" });
        generatetoken(res,accessToken);
        const data = user.dataValues;
        data.message ="Updated successfully";
        // console.log('return', data);
        res.status(200).render('profile', {user : data} );
    
    }
}

async function verifytoken(res, token) {
    return new Promise((resolve, reject) => {
        token = token.authtoken;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(401);
                reject(new Error("User not Authorised"));
            } else {
                const user = decoded.user;
                user.message = user.message ? user.message : "";
                console.log('token vake', user);
                resolve(user);
            }
        });
    });
}

exports.addmember = async (req, res, next) => {
    try {
        const { email, user_id, name, bio, phonenumber, role } = req.body;
        const token = req.cookies;

        const findmembers = await Members.findOne({ where: { email: email } });
        console.log('findmembers--------------------------------------', findmembers);

        if (!findmembers) {
            console.log('user_id', user_id);
            await Members.create({
                name: name,
                email: email,
                bio: bio,
                role: role,
                phone_number: phonenumber,
                user_id: user_id
            });

            const user = await verifytoken(res, token);
            const members = await Members.findAll({ where: { user_id: user.id } });

            res.status(200).render('dashboard', { user: user, members: members });
        } else {
            res.status(404).send("Member already exists");
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updatemember = async (req, res, next) => {
    const { email, user_id ,name ,bio ,phonenumber,role ,id} = req.body; 
    console.log('user_id' ,user_id)
      await Members.update({
            name: name,
            email : email,
            bio : bio,
            role : role,
            phone_number : phonenumber,
            user_id: user_id
        },{
            where: {
                id: id,
            }
        }

        );  
    const user = await Users.findOne({ where: { id: user_id } });
    const members = await Members.findAll({ where: { user_id: user_id } });
    console.log('user--------------------------------------', req)
    res.status(200).render('dashboard', { user: user, members: members });
    
}
exports.deletemember= async (req , res , next) =>{
    const { id } = req.body; 
    console.log('user_id' ,id)
      await Members.destroy({where :{
        id: id
      }
    });  
    const token = req.cookies;
    const user = await verifytoken(res, token);
    const members = await Members.findAll({ where: { user_id: user.id } });
    console.log('user--------------------------------------', req)
    res.status(200).render('dashboard', { user: user, members: members });
}

exports.saveprofilepic = async (req, res, next) => {
    const { id } = req.body;

    console.log('saveprofilepic', req.file);

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if(req.file !== undefined){
        const user_pic = await Users.findOne({ where: { id: id } });
        console.log('pic',user_pic.profilepic)
        if(user_pic.profilepic){
            fs.unlinkSync("public/uploads/"+user_pic.profilepic);
        }
        console.log('saveprofilepic else----------------', req.file);
        await Users.update(
            {
                profilepic:id + '-'+ req.file.originalname, 
            },
            {
              where: {
                id: id,
              },
            }
          );
        }
        const user = await Users.findOne({ where: { id: id } });
        const accessToken = jwt.sign({
            user: user ,
        },process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "60m" });
        generatetoken(res,accessToken);
        const data = user.dataValues;
        data.message ="Updated successfully";
        console.log('return/>>>>>>>>>>>>>>>>>>>>>>>>', data);
        res.redirect('/profile');
};


exports.deleteprofilepic = async (req, res, next) => {
    const { id } = req.body;


    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
        const user_pic = await Users.findOne({ where: { id: id } });
        console.log('pic',user_pic.profilepic)
        if(user_pic.profilepic){
            fs.unlinkSync("public/uploads/"+user_pic.profilepic);
        }
        await Users.update(
            {
                profilepic:'', 
            },
            {
              where: {
                id: id,
              },
            }
          );

        const user = await Users.findOne({ where: { id: id } });
        const accessToken = jwt.sign({
            user: user ,
        },process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "60m" });
        generatetoken(res,accessToken);

        const data = user.dataValues;
        data.message ="Updated successfully";
        console.log('return/>>>>>>>>>>>>>>>>>>>>>>>>', data);
        res.redirect('/profile');
};


function generatetoken(res,accessToken) {
    res.cookie('authtoken', accessToken ,{ maxAge: 600000, httpOnly: true });
}

exports.getmembers =  (req, res) => {
    Members.findAll({})
    .then((users) => {
      return res.status(200).json({
        status: true,
        data: users,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        status: false,
        error: err,
      });
    });
}


