const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TaiKhoan = require('../models/taikhoan'); // Import cái model bác vừa gửi tui

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "https://cinexe-photos.onrender.com/auth/google/callback",
        proxy: true,
       
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly'],
    prompt: 'consent',   
    accessType: 'offline'
    },
        async (accessToken, refreshToken, profile, done) => {
            // Chuẩn bị dữ liệu từ Google trả về
            const userMoi = {
                googleId: profile.id,
                hoTen: profile.displayName,
                email: profile.emails[0].value,
                anhDaiDien: profile.photos[0].value,
                accessToken: accessToken // Lưu token vào đây để dùng bên photos.js
            };

            try {
                // Tìm xem user này đã tồn tại trong DB chưa
                let user = await TaiKhoan.findOne({ googleId: profile.id });

                if (user) {
                    // Nếu có rồi thì cập nhật lại Token mới (vì token Google có hạn)
                    user = await TaiKhoan.findOneAndUpdate(
                        { googleId: profile.id },
                        { accessToken: accessToken, anhDaiDien: userMoi.anhDaiDien },
                        { new: true }
                    );
                    return done(null, user);
                } else {
                    // Nếu chưa có thì tạo mới luôn
                    user = await TaiKhoan.create(userMoi);
                    return done(null, user);
                }
            } catch (err) {
                console.error(err);
                return done(err, null);
            }
        }));

    passport.serializeUser((user, done) => {
        done(null, user.id); // Lưu ID vào session
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await TaiKhoan.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};