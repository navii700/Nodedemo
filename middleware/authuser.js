const asyncHandler = require('express-async-handler');

const checkAuthUser = asyncHandler( async(req, res, next) => {
    
    if (req.isAuthenticated()) {
        console.log('logged');
        next();
        // Render the protected dashboard page
    } else {
        res.redirect('/login');
    }
 
});


module.exports = checkAuthUser;