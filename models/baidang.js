const mongoose = require('mongoose');

const baiDangSchema = new mongoose.Schema({
    urlanh: { type: String, required: true },
    tieude: { type: String, required: true },
    mota: { type: String },
    nguoidang: { type: mongoose.Schema.Types.ObjectId, ref: 'TaiKhoan' },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'TaiKhoan', default: [] }
}, { timestamps: true });

module.exports = mongoose.model('BaiDang', baiDangSchema);