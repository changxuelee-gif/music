'use strict';

/**
 * 开放 API（带 API Key 鉴权）
 * 用途：让你自己或合作方通过接口批量提交歌单/歌曲/音乐人，不需要手动在后台点。
 * 安全：必须在 Header 带 X-API-Key，值与服务端 .env 的 OPEN_API_KEY 一致。
 * 合规：所有外链仍走白名单校验，不存储任何音频。
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const config = require('../../config');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { clean } = require('../../utils/xss');
const { ALLOWED_DOMAINS, isAllowedUrl } = require('../../middlewares/whitelist');

// 鉴权中间件
router.use((req, res, next) => {
  if (!config.openApiKey) return fail(res, '开放接口未启用', 403);
  const key = req.get('X-API-Key') || req.query.api_key;
  if (key !== config.openApiKey) return fail(res, 'API Key 无效', 401);
  next();
});

/** 健康检查 */
router.get('/ping', (req, res) => ok(res, { pong: true, time: new Date() }));

/** 提交歌单（批量） */
router.post('/playlists', asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  const results = [];
  for (const it of items.slice(0, 50)) {
    if (!it.title || !it.slug) continue;
    await query(
      `INSERT INTO playlists (title, slug, cover, summary, description, category_id, curator, seo_title, seo_keywords, seo_desc, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE title=VALUES(title), summary=VALUES(summary), updated_at=NOW()`,
      [
        clean(it.title, 120), clean(it.slug, 100), it.cover || null,
        clean(it.summary, 300), clean(it.description, 1000),
        it.categoryId || null, clean(it.curator || '声屿编辑部', 50),
        clean(it.seoTitle, 200), clean(it.seoKeywords, 200), clean(it.seoDesc, 300)
      ]
    );
    results.push(it.slug);
  }
  return ok(res, { inserted: results.length, slugs: results }, '歌单已提交');
}));

/** 提交歌曲（批量，必须带 playlistSlug） */
router.post('/songs', asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  let okCount = 0, skipCount = 0;
  for (const it of items.slice(0, 200)) {
    if (!it.playlistSlug || !it.title || !it.artistName || !it.url) { skipCount++; continue; }
    if (!isAllowedUrl(it.url)) { skipCount++; continue; }
    const [pl] = await query('SELECT id FROM playlists WHERE slug=? LIMIT 1', [it.playlistSlug]);
    if (!pl) { skipCount++; continue; }
    await query(
      `INSERT INTO songs (playlist_id, title, artist_name, platform, url, sort, status)
       VALUES (?,?,?,?,?,?,1)`,
      [pl.id, clean(it.title, 120), clean(it.artistName, 120),
       it.platform || 'qq', it.url, it.sort || 100]
    );
    okCount++;
  }
  return ok(res, { inserted: okCount, skipped: skipCount }, '歌曲已提交');
}));

/** 提交音乐人（批量） */
router.post('/artists', asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body) ? req.body : [req.body];
  let okCount = 0, skipCount = 0;
  for (const it of items.slice(0, 100)) {
    if (!it.name || !it.slug || !it.officialUrl) { skipCount++; continue; }
    if (!isAllowedUrl(it.officialUrl)) { skipCount++; continue; }
    await query(
      `INSERT INTO artists (name, slug, country, genre, platform, official_url, bio, is_hot, sort, status)
       VALUES (?,?,?,?,?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE name=VALUES(name), bio=VALUES(bio), updated_at=NOW()`,
      [clean(it.name, 80), clean(it.slug, 100), it.country || null, it.genre || null,
       it.platform || 'qq', it.officialUrl, clean(it.bio, 500),
       it.isHot ? 1 : 0, it.sort || 100]
    );
    okCount++;
  }
  return ok(res, { inserted: okCount, skipped: skipCount }, '音乐人已提交');
}));

/** 运营数据概览 */
router.get('/stats', asyncHandler(async (req, res) => {
  const [pl] = await query('SELECT COUNT(*) c FROM playlists WHERE status=1');
  const [sg] = await query('SELECT COUNT(*) c FROM songs WHERE status=1');
  const [ar] = await query('SELECT COUNT(*) c FROM artists WHERE status=1');
  const [cmp] = await query(`SELECT COUNT(*) c FROM complaints WHERE status='pending'`);
  return ok(res, {
    playlists: pl.c, songs: sg.c, artists: ar.c, pendingComplaints: cmp.c
  });
}));

module.exports = router;
