const express = require('express');
const router = express.Router();
const passport = require('passport');

// Link: /auth/google
router.get('/google', passport.authenticate('google', { 
    scope: [
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/photospicker.mediaitems.readonly' // CHỖ NÀY PHẢI ĐỔI NÈ BÁC!
    ],
    prompt: 'consent',   
    accessType: 'offline' 
}));

// Link: /auth/google/callback
router.get('https://cxe-photos.onrender.com/auth/google/callback', 
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