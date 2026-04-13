// routers/photos.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/list', async (req, res) => {
    // Kiểm tra xem đã đăng nhập chưa
    if (!req.user || !req.user.accessToken) {
        return res.status(401).json({ error: "Bác chưa đăng nhập hoặc mất Token rồi!" });
    }

    try {
        // Gửi yêu cầu lên Google Photos để lấy danh sách ảnh
        const response = await axios.get('https://photoslibrary.googleapis.com/v1/mediaItems', {
            headers: {
                'Authorization': `Bearer ${req.user.accessToken}`
            },
            params: { 
                pageSize: 20
            }
        });

        // Nếu có ảnh, mình trả về cho Frontend
        const dsAnh = response.data.mediaItems || [];
        res.json(dsAnh); 
    } catch (err) {
        console.error("Lỗi lấy ảnh:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "Không lấy được ảnh từ mây rồi bác ơi!" });
    }
});

module.exports = router;