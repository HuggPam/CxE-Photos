const express = require('express');
const router = express.Router();
const BaiDang = require('../models/baidang');
const cloudinary = require('cloudinary').v2;
const TaiKhoan = require('../models/taikhoan');

router.get('/', async (req, res) => {
    if (!req.user) return res.redirect('/auth/google');
    try {
        // 1. Ảnh do mình đăng
        const myPosts = await BaiDang.find({ nguoidang: req.user._id }).sort({ createdAt: -1 });

        // 2. Ảnh đã lưu
        const currentUser = await TaiKhoan.findById(req.user._id).populate('daLuu');
        const savedPosts = currentUser.daLuu; 

        // 3. THÊM MỚI: Lấy danh sách ảnh đã thả tim (Like)
        const likedPosts = await BaiDang.find({ likes: req.user._id }).sort({ createdAt: -1 });

        // Truyền cả 3 mảng này ra giao diện
        res.render('profile', { 
            user: req.user, 
            myPosts: myPosts,
            savedPosts: savedPosts,
            likedPosts: likedPosts // Đừng quên dòng này
        });
    } catch (error) {
        console.error("Lỗi load trang cá nhân:", error);
        res.redirect('/');
    }
});

router.post('/xoa/:id', async (req, res) => {
    try {
        const post = await BaiDang.findById(req.params.id);
        if (!post || post.nguoidang.toString() !== req.user._id.toString()) return res.redirect('/profile');

        await BaiDang.findByIdAndDelete(req.params.id);
        res.redirect('/profile');
    } catch (error) {
        res.redirect('/profile');
    }
});

router.post('/sua/:id', async (req, res) => {
    try {
        const { tieude_moi, mota_moi } = req.body;
        await BaiDang.findOneAndUpdate(
            { _id: req.params.id, nguoidang: req.user._id },
            { 
                tieude: tieude_moi, 
                mota: mota_moi 
            }
        );
        
        res.redirect('/profile');
    } catch (error) {
        console.error("Lỗi sửa bài:", error);
        res.redirect('/profile');
    }
});

module.exports = router;