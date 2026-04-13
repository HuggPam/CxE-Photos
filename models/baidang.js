const mongoose = require('mongoose');

const baidangSchema = new mongoose.Schema({
    urlanh: String,     // Link vĩnh viễn từ Cloudinary
    tieude: String,
    nguoidang: { type: mongoose.Schema.Types.ObjectId, ref: 'taikhoan' },
    ngaydang: { type: Date, default: Date.now }
});

module.exports = mongoose.model('baidang', baidangSchema);