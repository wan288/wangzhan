const multer = require('multer');
const path = require('path');

// 设置存储引擎和文件命名规则
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 图片将存储在后端项目的 'uploads/' 目录下
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 文件类型过滤
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!'); // 只允许图片文件
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 限制文件大小为 5MB
});

// @desc    上传单个图片文件
// @route   POST /api/upload
// @access  Private/Admin/Merchant/Customer
const uploadSingleImage = (req, res) => {
  if (req.file) {
    // 返回图片的URL，前端可以直接使用
    res.json({
      message: '图片上传成功',
      url: `/uploads/${req.file.filename}`,
    });
  } else {
    res.status(400).json({ message: '图片上传失败' });
  }
};

module.exports = {
  upload,
  uploadSingleImage,
}; 