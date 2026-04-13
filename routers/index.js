// routers/index.js
const express = require('express');
const router = express.Router();
const BaiDang = require('../models/baidang');

router.get('/', async (req, res) => {
    try {
        // Lấy ảnh đã chia sẻ từ DB, lôi luôn tên người đăng ra (populate)
        const dsBaidang = await BaiDang.find().populate('nguoidang').sort({ ngaydang: -1 });
        res.render('index', { user: req.user, images: dsBaidang });
    } catch (error) {
        res.render('index', { user: req.user, images: [] });
    }
});

module.exports = router;