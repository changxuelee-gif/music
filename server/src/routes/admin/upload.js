'use strict';

/**
 * 后台上传（图片）：对接阿里云 OSS，未配置时落本地 uploads
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const config = require('../../config');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { adminAuth } = require('../../middlewares/auth');
const { uploadBuffer } = require('../../config/storage');
const { uploadLimiter } = require('../../middlewares/rateLimit');

router.use(adminAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return cb(new Error('仅支持 JPG / PNG / WEBP / GIF 图片'));
    }
    cb(null, true);
  }
});

router.post('/upload/image', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? `图片不能超过 ${config.upload.maxMb}MB` : err.message;
      return fail(res, message, 400);
    }
    try {
      if (!req.file) return fail(res, '请选择图片', 400);
      const ext = path.extname(req.file.originalname) || '.jpg';
      const result = await uploadBuffer(req.file.buffer, `cover${ext}`, req.file.mimetype);
      return ok(res, { url: result.url, provider: result.provider }, '上传成功');
    } catch (e) {
      next(e);
    }
  });
});

/** 提供当前 OSS 配置状态，便于前端提示 */
router.get('/upload/config', asyncHandler(async (req, res) => {
  const { ossEnabled } = require('../../config/storage');
  return ok(res, { provider: ossEnabled ? 'oss' : 'local', maxMb: config.upload.maxMb });
}));

module.exports = router;
