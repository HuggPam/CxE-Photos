const express = require('express');
const router = express.Router();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const BaiDang = require('../models/baidang');

cloudinary.config({
    cloud_name: 'dozbjg1wo',
    api_key: '758495254216138',
    api_secret: 'NCJaoI0zyu3ETQ1IQ09yKSOQxPY'
});

router.get('/', async (req, res) => {
    if (!req.user || !req.user.accessToken) return res.redirect('/');
    try {
        const response = await axios.post('https://photospicker.googleapis.com/v1/sessions', {}, {
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
        });
        res.render('thu_vien_picker', { user: req.user, pickerUri: response.data.pickerUri, sessionId: response.data.id });
    } catch (error) { res.send("Lỗi tạo phiên chọn ảnh!"); }
});

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


router.get('/anh_proxy', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        const response = await axios.get(imageUrl, {
            responseType: 'stream', // Tải dưới dạng luồng dữ liệu
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` } // Chèn Token vào đây!
        });
        response.data.pipe(res); // Bơm thẳng luồng ảnh ra cho thẻ <img src>
    } catch (error) { res.status(500).send('Lỗi tải ảnh'); }
});


router.post('/chia_se', async (req, res) => {
    console.log("=== [START] BẮT ĐẦU CHIA SẺ ẢNH FROM GOOGLE ===");
    
    try {
        // LOG 1: Kiểm tra dữ liệu Form gửi lên
        const { urlgoc, tieude } = req.body;
        console.log("-> Dữ liệu nhận được:", { urlgoc: urlgoc ? "Có link" : "RỖNG!", tieude });

        if (!urlgoc) {
            console.error("❌ Lỗi: Không nhận được urlgoc từ Form. Bác check lại name='urlgoc' ở EJS nha!");
            return res.status(400).send("Thiếu link ảnh gốc!");
        }

        // LOG 2: Tải ảnh từ Google
        console.log("-> Đang tải ảnh từ Google...");
        const googleRes = await axios.get(`${urlgoc}=s0`, {
            responseType: 'arraybuffer',
            headers: { 'Authorization': `Bearer ${req.user.accessToken}` }
        }).catch(err => {
            console.error("❌ Lỗi Google Fetch:", err.message);
            throw new Error("Không thể tải ảnh từ Google Photos. Có thể Token hết hạn!");
        });
        console.log("✅ Tải ảnh Google thành công!");

        // LOG 3: Chuyển đổi Base64
        const base64Image = Buffer.from(googleRes.data, 'binary').toString('base64');
        const dataUri = `data:${googleRes.headers['content-type']};base64,${base64Image}`;
        console.log("-> Đã chuyển ảnh sang Base64.");

        // LOG 4: Upload lên Cloudinary
        console.log("-> Đang đẩy lên Cloudinary...");
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
            folder: 'cxe_photos_agu'
        }).catch(err => {
            console.error("❌ Lỗi Cloudinary Upload:", err.message);
            throw new Error("Cloudinary từ chối nhận ảnh. Bác check lại KEY/SECRET nha!");
        });
        console.log("✅ Cloudinary trả về link:", uploadRes.secure_url);

        // LOG 5: Lưu MongoDB
        console.log("-> Đang lưu vào MongoDB...");
        await BaiDang.create({
            urlanh: uploadRes.secure_url,
            tieude: tieude,
            nguoidang: req.user._id
        });
        console.log("✅ Đã lưu vào MongoDB thành công!");

        console.log("=== [DONE] CHIA SẺ HOÀN TẤT ===");
        res.redirect('/'); 

    } catch (error) {
        console.error("=== [FAIL] LỖI CHIA SẺ ===");
        console.error("Nội dung lỗi:", error.message);
        // Nếu lỗi, quăng ra trang thông báo cho bác dễ nhìn
        res.status(500).send(`Lỗi rồi bác Luke ơi: ${error.message}`);
    }
});

module.exports = router;