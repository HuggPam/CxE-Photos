const express = require('express');
const router = express.Router();
const axios = require('axios');
const upload = require('../middlewares/upload'); // Import file cấu hình upload ở Bước 3
const Post = require('../models/Post'); // Import model ở Bước 4

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
        
        const count = await mongoose.connection.db.collection('posts').countDocuments();
        console.log("Số lượng thực tế trong collection 'posts':", count);
        console.log("=== MẢNG ẢNH LẤY TỪ MONGODB ===");
        console.log(images);

        res.render('index', { 
            user: req.user, 
            images: images 
        });

    } catch (error) {
        console.error("Lỗi lấy ảnh mây:", error.message);
        res.render('index', { user: req.user, images: [] });
    }
});

router.get('/upload', (req, res) => {
    res.render('dang_anh', { user: req.user || null });
});

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("Vui lòng chọn ảnh!");
        }

        const newPost = new Post({
            title: req.body.title,
            description: req.body.description,
            imageUrl: req.file.path 
        });

        await newPost.save();

        res.redirect('/'); 

    } catch (error) {
        console.error("Lỗi đăng ảnh:", error);
        res.status(500).send("Có lỗi xảy ra khi lưu ảnh!");
    }
});

router.get('/', async (req, res) => {
    try {
        // Lấy toàn bộ bài đăng từ MongoDB, sắp xếp cái mới nhất lên đầu
        const images = await Post.find().sort({ createdAt: -1 });
        
        // Truyền mảng images vừa lấy được ra trang index
        res.render('index', { 
            user: req.user || null, 
            images: images 
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu từ MongoDB:", error);
        res.render('index', { 
            user: req.user || null, 
            images: [] 
        });
    }
});


module.exports = router;