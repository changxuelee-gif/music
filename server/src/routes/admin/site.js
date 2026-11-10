'use strict';

/** 后台站点配置（SEO 文案 / 资质 / 免责声明） */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { adminAuth, adminOnly } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { bustContentCaches } = require('../../services/cache');

router.use(adminAuth);

// 允许修改的配置键（白名单，避免写入任意键）
const ALLOWED_KEYS = [
  'site_name', 'site_slogan', 'site_keywords', 'site_description',
  'icp_no', 'wenwangwen_no', 'company_name', 'complaint_email', 'complaint_phone',
  'disclaimer', 'privacy_policy', 'hot_search_words', 'analytics_code'
];

router.get('/site/config', asyncHandler(async (req, res) => {
  const rows = await query('SELECT config_key, config_value, description, updated_at FROM site_config');
  return ok(res, rows.map((r) => ({
    key: r.config_key, value: r.config_value, description: r.description, updatedAt: r.updated_at
  })));
}));

/** 批量保存（仅管理员） */
router.put('/site/config', adminOnly, asyncHandler(async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || !items.length) return fail(res, '请提交要保存的配置项', 400);

  for (const item of items.slice(0, 30)) {
    const key = String(item.key || '');
    if (!ALLOWED_KEYS.includes(key)) continue;
    const value = clean(item.value, 8000);
    await query(
      `INSERT INTO site_config (config_key, config_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)`,
      [key, value]
    );
  }

  await bustContentCaches();
  return ok(res, null, '配置已保存');
}));

module.exports = router;
