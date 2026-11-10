'use strict';

/**
 * 版权投诉（公开提交 + 权属材料上传）
 * 合规要求：页面必须提供版权投诉入口，提交后生成后台工单
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../../config/db');
const config = require('../../config');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { clean, isEmail, isPhone } = require('../../utils/xss');
const { createTicketNo, getClientIp } = require('../../utils/helpers');
const { uploadBuffer } = require('../../config/storage');
const { complaintLimiter, uploadLimiter } = require('../../middlewares/rateLimit');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxMb * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('仅支持 JPG / PNG / WEBP / PDF 格式的权属材料'));
    }
    cb(null, true);
  }
});

/** 上传权属材料（返回 URL 后再随表单提交） */
router.post('/upload', uploadLimiter, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? `文件不能超过 ${config.upload.maxMb}MB` : err.message;
      return fail(res, message, 400);
    }
    try {
      if (!req.file) return fail(res, '请选择要上传的权属材料', 400);
      const ext = path.extname(req.file.originalname) || '';
      const result = await uploadBuffer(req.file.buffer, `evidence${ext}`, req.file.mimetype);
      return ok(res, { url: result.url, provider: result.provider }, '上传成功');
    } catch (e) {
      next(e);
    }
  });
});

/** 提交投诉工单 */
router.post('/', complaintLimiter, asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 50);
  const contact = clean(req.body.contact, 100);
  const type = ['copyright', 'info', 'link', 'other'].includes(req.body.type) ? req.body.type : 'copyright';
  const targetUrl = clean(req.body.targetUrl, 500);
  const description = clean(req.body.description, 2000);
  const evidenceUrl = clean(req.body.evidenceUrl, 500);

  if (!name) return fail(res, '请填写投诉人姓名或单位名称', 400);
  if (!contact) return fail(res, '请填写联系方式', 400);
  if (!isEmail(contact) && !isPhone(contact) && !/^0\d{2,3}-?\d{7,8}$/.test(contact)) {
    return fail(res, '联系方式格式不正确，请填写手机号或邮箱', 400);
  }
  if (description.length < 10) return fail(res, '请补充投诉说明（不少于 10 个字）', 400);

  const ticketNo = createTicketNo();
  await query(
    `INSERT INTO complaints (ticket_no, name, contact, type, target_url, description, evidence_url, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticketNo, name, contact, type, targetUrl, description, evidenceUrl, getClientIp(req)]
  );

  return ok(res, { ticketNo, status: 'pending' }, '投诉已提交，我们将依法核查处理');
}));

module.exports = router;
