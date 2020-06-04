const router = require('express').Router();

router.get('/me', function(req, res){
    return res.json({
        username: req.user.username,
        displayName: req.user.displayName,
        bio: req.user.bio,
        rating: req.user.rating
    });
});


module.exports = router;