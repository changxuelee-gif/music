'use strict';

/**
 * 公共站点接口：站点配置 / 首页聚合 / 分类标签
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const redis = require('../../config/redis');
const config = require('../../config');
const { ok, asyncHandler } = require('../../utils/response');
const { getHomeData, getCategoriesWithCount } = require('../../services/homeService');
const { getConfigMap } = require('../../services/siteConfig');
const { ALLOWED_DOMAINS } = require('../../middlewares/whitelist');
const { PLATFORM_LABEL } = require('../../services/playlistService');

/** 站点配置 + 资质信息（页脚、免责声明、SEO 使用） */
router.get('/site/config', asyncHandler(async (req, res) => {
  const map = await getConfigMap();
  return ok(res, {
    siteName: map.site_name,
    slogan: map.site_slogan,
    keywords: map.site_keywords,
    description: map.site_description,
    companyName: map.company_name,
    icpNo: map.icp_no,
    wenwangwenNo: map.wenwangwen_no,
    complaintEmail: map.complaint_email,
    complaintPhone: map.complaint_phone,
    disclaimer: map.disclaimer,
    privacyPolicy: map.privacy_policy,
    analyticsCode: map.analytics_code || '',
    hotSearchWords: (map.hot_search_words || '').split(',').filter(Boolean),
    platforms: Object.entries(PLATFORM_LABEL).map(([key, label]) => ({ key, label })),
    allowedDomains: ALLOWED_DOMAINS
  });
}));

/** 首页聚合数据（Redis 缓存） */
router.get('/home', asyncHandler(async (req, res) => {
  const data = await getHomeData();
  return ok(res, data);
}));

/** 分类列表（可按 type 过滤） */
router.get('/categories', asyncHandler(async (req, res) => {
  const type = ['style', 'scene', 'language'].includes(req.query.type) ? req.query.type : null;
  const cacheKey = `home:categories:${type || 'all'}`;
  const cached = await redis.get(cacheKey);
  if (cached) return ok(res, cached);

  let rows;
  if (type) {
    rows = await getCategoriesWithCount(type, 50);
  } else {
    rows = await query(
      `SELECT c.id, c.name, c.slug, c.type, c.icon, c.color, c.intro, c.sort,
        (SELECT COUNT(*) FROM playlists p WHERE p.status = 1
          AND (p.category_id = c.id OR p.scene_id = c.id OR p.language_id = c.id)) AS playlist_count
       FROM categories c WHERE c.status = 1 ORDER BY FIELD(c.type,'style','scene','language'), c.sort ASC`
    );
    rows = rows.map((r) => ({
      id: r.id, name: r.name, slug: r.slug, type: r.type, icon: r.icon,
      color: r.color, intro: r.intro, playlistCount: r.playlist_count
    }));
  }
  await redis.set(cacheKey, rows, config.cache.listTtl);
  return ok(res, rows);
}));

/** 标签列表（前端多选筛选） */
router.get('/tags', asyncHandler(async (req, res) => {
  const cacheKey = 'home:tags:v1';
  const cached = await redis.get(cacheKey);
  if (cached) return ok(res, cached);

  const rows = await query(
    `SELECT id, name, slug, type, color FROM tags WHERE status = 1 ORDER BY sort ASC`
  );
  await redis.set(cacheKey, rows, config.cache.listTtl);
  return ok(res, rows);
}));

module.exports = router;
