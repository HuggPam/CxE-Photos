const express = require('express');
const router = express.Router();
const passport = require('passport');

// Link: /auth/google
router.get('/google', passport.authenticate('google', { 
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/photoslibrary.readonly' // QUYỀN XEM ẢNH ĐÂY NÈ!
    ] 
}));

// Link: /auth/google/callback
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.success = "Chào " + req.user.displayName + "! Đã kết nối Google Photos.";
        res.redirect('/');
    }
);

// Đăng xuất
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;