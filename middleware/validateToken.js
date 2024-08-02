const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { Users } = require('../models'); 

const validateToken = asyncHandler( async(req, res, next) => {
    let token = req.cookies; 
    if(!token){
        res.redirect("/login");
        throw new Error("User is not authorised or token is missing.");
    }
        if(token.authtoken){
            token = token.authtoken
           
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
                if(err){
                    res.status(401);
                    throw new Error("User not Authorised");
                }
                // console.log(decoded);
                const user = decoded.user;
                if( user.message)
                {
                    user.message= user.message;
                }
                else{
                    user.message= "";
                }
                // console.log('token',user);
                req.user = user;
                next();
            });
           
            
        }else{
            res.redirect("/login");
        }
        
        //  return next;
});

module.exports = validateToken;