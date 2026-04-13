require('dotenv').config(); // 1. Gọi dotenv ngay đầu tiên để đọc file .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const app = express();

const indexRouter = require('./routers/index');
const authRouter = require('./routers/auth');
const thuVienRouter = require('./routers/thu_vien');

const uri = process.env.MONGODB_URI; 
mongoose.connect(uri)
    .then(() => console.log('Đã kết nối MongoDB Atlas thành công!'))
    .catch(err => console.log('Lỗi kết nối CSDL: ', err));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    name: 'CxE_Photos_Session',
    secret: process.env.SESSION_SECRET || 'Bi-Mat-Quan-Su', // Dùng secret từ .env
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // Hết hạn sau 30 ngày
    }
}));

require('./config/passport')(passport); // Gọi cấu hình passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user || null;

    const err = req.session.error;
    const msg = req.session.success;
    
    delete req.session.error;
    delete req.session.success;
    
    res.locals.message = '';
    if (err) res.locals.message = `<div class="alert alert-danger">${err}</div>`;
    if (msg) res.locals.message = `<div class="alert alert-success">${msg}</div>`;
    
    next();
});

app.use('/', indexRouter);
app.use('/auth', authRouter);     
app.use('/thu_vien', thuVienRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CxEP đang chạy tại: http://localhost:${PORT}`);
});