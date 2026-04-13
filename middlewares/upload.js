const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình nơi lưu trữ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cxe_photos', // Tên thư mục nó sẽ tạo trên Cloudinary
    allowedFormats: ['jpeg', 'png', 'jpg', 'webp'], // Các đuôi ảnh cho phép
  },
});

const upload = multer({ storage: storage });

module.exports = upload;