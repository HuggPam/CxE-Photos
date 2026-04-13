const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        let images = [];
        // Nếu ông Luke đã đăng nhập và có Token
        if (req.user && req.user.accessToken) {
            const response = await axios.get('https://photoslibrary.googleapis.com/v1/mediaItems', {
                headers: { 'Authorization': `Bearer ${req.user.accessToken}` },
                params: { pageSize: 50 } // Lấy hẳn 50 tấm cho nó rực rỡ
            });
            images = response.data.mediaItems || [];
        }

        res.render('index', { 
            user: req.user, 
            images: images 
        });

    } catch (error) {
        console.error("Lỗi lấy ảnh mây:", error.message);
        res.render('index', { user: req.user, images: [] });
    }
});

module.exports = router;