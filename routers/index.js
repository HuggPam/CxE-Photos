// routers/index.js
const express = require('express');
const router = express.Router();
const BaiDang = require('../models/baidang');
const TaiKhoan = require('../models/taikhoan');

router.get('/', async (req, res) => {
    try {
        // Lấy ảnh đã chia sẻ từ DB, lôi luôn tên người đăng ra (populate)
        const dsBaidang = await BaiDang.find().populate('nguoidang').sort({ ngaydang: -1 });
        res.render('index', { user: req.user, images: dsBaidang });
    } catch (error) {
        res.render('index', { user: req.user, images: [] });
    }
});

router.get('/search', async (req, res) => {
    try {
        const tuKhoa = req.query.q; // Lấy chữ bác nhập vào từ thanh tìm kiếm
        
        // Nếu người dùng không nhập gì mà ấn Enter thì ném về trang chủ
        if (!tuKhoa) return res.redirect('/');

        // Tìm kiếm "thần thánh": Tìm trong cả Tiêu đề HOẶC Mô tả, không phân biệt hoa thường ('i')
        const ketQua = await BaiDang.find({
            $or: [
                { tieude: { $regex: tuKhoa, $options: 'i' } },
                { mota: { $regex: tuKhoa, $options: 'i' } }
            ]
        }).populate('nguoidang').sort({ createdAt: -1 });

        res.render('index', { 
            user: req.user, 
            images: ketQua, 
            tuKhoa: tuKhoa // Truyền lại từ khóa ra ngoài để giữ chữ trên thanh tìm kiếm
        });
    } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
        res.redirect('/');
    }
});

router.get('/chi_tiet/:id', async (req, res) => {
    try {
        const item = await BaiDang.findById(req.params.id).populate('nguoidang');

        const related = await BaiDang.find({ _id: { $ne: req.params.id } }).limit(20);

        res.render('chi_tiet', {
            user: req.user,
            item: item,
            related: related
        });
    } catch (error) {
        console.error("Lỗi trang chi tiết:", error);
        res.redirect('/');
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        const post = await BaiDang.findById(req.params.id);
        if (!post) return res.redirect('/'); // Không thấy ảnh thì về trang chủ luôn

        const response = await axios({
            url: post.urlanh,
            method: 'GET',
            responseType: 'stream'
        });

        const fileName = `CinexE_${req.params.id}.jpg`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        response.data.pipe(res);

    } catch (error) {
        console.error("Lỗi download:", error);
        res.redirect('/');
    }
});

router.post('/like/:id', async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/auth/google');
        }

        // 2. Nếu đã đăng nhập thì mới chạy code dưới này
        const post = await BaiDang.findById(req.params.id);

        if (post.likes.includes(req.user._id)) {
            post.likes.pull(req.user._id);
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.redirect('/chi_tiet/' + req.params.id);

    } catch (error) {
        res.redirect('/chi_tiet/' + req.params.id);
    }
});

router.post('/save/:id', async (req, res) => {
    try {
        console.log("1. Đã bấm nút lưu, ID ảnh:", req.params.id);
        console.log("2. Return URL gửi lên:", req.body.returnUrl);

        if (!req.user) return res.redirect('/auth/google');

        const user = await TaiKhoan.findById(req.user._id);
        
        if (user.daLuu.includes(req.params.id)) {
            user.daLuu.pull(req.params.id);
            console.log("3. Đã BỎ LƯU ảnh");
        } else {
            user.daLuu.push(req.params.id);
            console.log("3. Đã LƯU ảnh thành công");
        }
        await user.save();
        
        req.user.daLuu = user.daLuu;
        
        const returnUrl = req.body.returnUrl || '/';
        console.log("4. Đang chuẩn bị quay về:", returnUrl);
        
        res.redirect(returnUrl);

    } catch (error) {
        console.error("CẢNH BÁO LỖI NÚT LƯU:", error);
        res.redirect('/');
    }
});

module.exports = router;