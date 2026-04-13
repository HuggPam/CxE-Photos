const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const BaiDang = require('../models/baidang');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// 1. ROUTE TẠO PHIÊN CHỌN ẢNH
router.get('/', async (req, res) => {
    if (!req.user || !req.user.accessToken) return res.redirect('/');
    try {
        const response = await axios.post('https://photospicker.googleapis.com/v1/sessions', {}, {
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
        });
        res.render('thu_vien_picker', { user: req.user, pickerUri: response.data.pickerUri, sessionId: response.data.id });
    } catch (error) { res.send("Lỗi tạo phiên chọn ảnh!"); }
});

// 2. ROUTE HỨNG DANH SÁCH ẢNH
router.get('/danh_sach', async (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId) return res.send("Không tìm thấy mã phiên!");
    try {
        const response = await axios.get(`https://photospicker.googleapis.com/v1/mediaItems?sessionId=${sessionId}`, {
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
        });
        const images = response.data.mediaItems || [];
        res.render('thu_vien', { user: req.user, images: images });
    } catch (error) { res.send("Lỗi tải danh sách ảnh!"); }
});

// ================================================================
// 3. ROUTE PROXY: ĐÓNG VAI TRÒ "NGƯỜI VẬN CHUYỂN" ẢNH CHO GIAO DIỆN
// ================================================================
router.get('/anh-proxy', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const response = await axios.get(imageUrl, {
            responseType: 'stream', // Tải dưới dạng luồng dữ liệu
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` } // Chèn Token vào đây!
        });
        response.data.pipe(res); // Bơm thẳng luồng ảnh ra cho thẻ <img src>
    } catch (error) { res.status(500).send('Lỗi tải ảnh'); }
});

// ================================================================
// 4. ROUTE POST CHIA SẺ (Đẩy lên Cloudinary và Mongo)
// ================================================================
router.post('/chia-se', async (req, res) => {
    try {
        const { urlgoc, tieude } = req.body;
        
        // 1. Server tự lấy ảnh từ Google về (vì Cloudinary không có token)
        const googleRes = await axios.get(`${urlgoc}=s0`, {
            responseType: 'arraybuffer',
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
        });
        
        // 2. Chuyển ảnh thành dạng Base64
        const base64Image = Buffer.from(googleRes.data, 'binary').toString('base64');
        const dataUri = `data:${googleRes.headers['content-type']};base64,${base64Image}`;

        // 3. Ném cục Base64 đó lên Cloudinary để lấy link vĩnh viễn
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
            folder: 'cxe_photos_agu'
        });

        // 4. Lưu MongoDB
        await BaiDang.create({
            urlanh: uploadRes.secure_url,
            tieude: tieude,
            nguoidang: req.user._id
        });

        res.redirect('/'); 
    } catch (error) {
        console.error("Lỗi chia sẻ:", error.message);
        res.redirect('/thu_vien');
    }
});

module.exports = router;