const mongoose = require('mongoose');

const TaiKhoanSchema = new mongoose.Schema({
    // ID định danh duy nhất từ Google (dùng để nhận diện khi bác đăng nhập lại)
    googleId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // Họ tên của bác lấy từ tài khoản Google
    hoTen: { 
        type: String, 
        required: true 
    },
    // Email AGU hoặc email cá nhân
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    // Đường dẫn ảnh đại diện (để hiện lên cái vòng tròn Avatar trên Navbar)
    anhDaiDien: String,
    // Lưu "chìa khóa" gọi API Google Photos
    accessToken: String,
    // Ngày tham gia hệ thống
    ngayTao: { 
        type: Date, 
        default: Date.now 
    }
});

// Xuất Model ra để dùng ở các file khác (như authRouter)
module.exports = mongoose.model('TaiKhoan', TaiKhoanSchema);