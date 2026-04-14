const mongoose = require('mongoose');

const TaiKhoanSchema = new mongoose.Schema({
    googleId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    hoTen: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    anhDaiDien: String,
    accessToken: String,

    daLuu: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'BaiDang'
    }],

    ngayTao: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('TaiKhoan', TaiKhoanSchema);