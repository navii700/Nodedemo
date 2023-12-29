const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');


const validateToken = asyncHandler( async(req, res, next) => {
    let token = req.cookies; 
        if(token.authtoken){
            token = token.authtoken
           
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if(err){
                    res.status(401);
                    throw new Error("User not Authorised");
                }
                console.log(decoded);
                req.user = decoded.user;
                next();
            });
            if(!token){
                res.status(400);
                throw new Error("User is not authorised or token is missing.");
            }
            
        }
        res.redirect("/login");
        // return next;
});

module.exports = validateToken;