const asyncHandler = require('express-async-handler');

const redirectAuthDashboard = asyncHandler( async(req, res, next) => {
    
    if (req.isAuthenticated()) {
        console.log('logged');
        return res.redirect('/dashboard');
        // Render the protected dashboard page
    } 
    next();
});


module.exports = redirectAuthDashboard;