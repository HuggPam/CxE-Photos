const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true }, // Nơi lưu link ảnh từ Cloudinary
    // author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Mở comment dòng này nếu bạn muốn lưu ai là người đăng
}, { timestamps: true }); // Tự động thêm ngày tạo (createdAt)

module.exports = mongoose.model('Post', postSchema, 'posts');