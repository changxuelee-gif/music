'use strict';

/**
 * 后台分类 / 标签 / 音乐人 / Banner 管理
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { adminAuth, adminOnly } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { createSlug } = require('../../utils/helpers');
const { assertAllowedUrl } = require('../../middlewares/whitelist');
const { bustContentCaches } = require('../../services/cache');

router.use(adminAuth);

/* ========================= 分类 ========================= */

router.get('/categories', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM playlists p WHERE p.status = 1
       AND (p.category_id = c.id OR p.scene_id = c.id OR p.language_id = c.id)) AS playlist_count
     FROM categories c ORDER BY FIELD(c.type,'style','scene','language'), c.sort ASC`
  );
  return ok(res, rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, type: r.type, icon: r.icon, color: r.color,
    intro: r.intro, sort: r.sort, status: r.status, playlistCount: r.playlist_count,
    seoTitle: r.seo_title, seoDesc: r.seo_desc
  })));
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 50);
  const type = ['style', 'scene', 'language'].includes(req.body.type) ? req.body.type : 'style';
  if (!name) return fail(res, '请填写分类名称', 400);
  const slug = clean(req.body.slug, 80) || createSlug(name);

  const dup = await query('SELECT id FROM categories WHERE type = ? AND slug = ? LIMIT 1', [type, slug]);
  if (dup.length) return fail(res, '同维度下 slug 已存在', 409);

  const result = await query(
    `INSERT INTO categories (name, slug, type, icon, color, intro, sort, status, seo_title, seo_desc)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, type, clean(req.body.icon, 200), clean(req.body.color, 20), clean(req.body.intro, 255),
      Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1, clean(req.body.seoTitle, 200), clean(req.body.seoDesc, 500)]
  );
  await bustContentCaches();
  return ok(res, { id: result.insertId, slug }, '创建成功');
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const name = clean(req.body.name, 50);
  if (!name) return fail(res, '请填写分类名称', 400);
  const slug = clean(req.body.slug, 80) || createSlug(name);
  await query(
    `UPDATE categories SET name = ?, slug = ?, icon = ?, color = ?, intro = ?, sort = ?, status = ?,
       seo_title = ?, seo_desc = ? WHERE id = ?`,
    [name, slug, clean(req.body.icon, 200), clean(req.body.color, 20), clean(req.body.intro, 255),
      Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1, clean(req.body.seoTitle, 200),
      clean(req.body.seoDesc, 500), id]
  );
  await bustContentCaches();
  return ok(res, { id, slug }, '已保存');
}));

router.delete('/categories/:id', adminOnly, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const used = await query(
    'SELECT COUNT(*) AS cnt FROM playlists WHERE category_id = ? OR scene_id = ? OR language_id = ?',
    [id, id, id]
  );
  if (used[0].cnt > 0) return fail(res, '该分类下仍有歌单，请先调整歌单分类', 400);
  await query('DELETE FROM categories WHERE id = ?', [id]);
  await bustContentCaches();
  return ok(res, null, '已删除');
}));

/* ========================= 标签 ========================= */

router.get('/tags', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT t.*, (SELECT COUNT(*) FROM playlist_tags pt WHERE pt.tag_id = t.id) AS used_count
     FROM tags t ORDER BY t.sort ASC`
  );
  return ok(res, rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, type: r.type, color: r.color,
    sort: r.sort, status: r.status, usedCount: r.used_count
  })));
}));

router.post('/tags', asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 30);
  if (!name) return fail(res, '请填写标签名称', 400);
  const slug = clean(req.body.slug, 50) || createSlug(name);
  const dup = await query('SELECT id FROM tags WHERE slug = ? LIMIT 1', [slug]);
  if (dup.length) return fail(res, '标签已存在', 409);

  const result = await query(
    'INSERT INTO tags (name, slug, type, color, sort, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, slug, ['style', 'scene', 'mood', 'language', 'other'].includes(req.body.type) ? req.body.type : 'mood',
      clean(req.body.color, 20), Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1]
  );
  await bustContentCaches();
  return ok(res, { id: result.insertId, slug }, '创建成功');
}));

router.put('/tags/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const name = clean(req.body.name, 30);
  if (!name) return fail(res, '请填写标签名称', 400);
  await query(
    'UPDATE tags SET name = ?, slug = ?, type = ?, color = ?, sort = ?, status = ? WHERE id = ?',
    [name, clean(req.body.slug, 50) || createSlug(name),
      ['style', 'scene', 'mood', 'language', 'other'].includes(req.body.type) ? req.body.type : 'mood',
      clean(req.body.color, 20), Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1, id]
  );
  await bustContentCaches();
  return ok(res, { id }, '已保存');
}));

router.delete('/tags/:id', adminOnly, asyncHandler(async (req, res) => {
  await query('DELETE FROM tags WHERE id = ?', [parseInt(req.params.id, 10)]);
  await bustContentCaches();
  return ok(res, null, '已删除');
}));

/* ========================= 音乐人 ========================= */

router.get('/artists', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT a.*, (SELECT COUNT(DISTINCT s.playlist_id) FROM songs s
       WHERE s.artist_id = a.id AND s.status = 1) AS playlist_count
     FROM artists a ORDER BY a.sort ASC, a.id ASC`
  );
  return ok(res, rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, avatar: r.avatar, country: r.country,
    genre: r.genre, platform: r.platform, officialUrl: r.official_url, bio: r.bio,
    isHot: Boolean(r.is_hot), sort: r.sort, status: r.status, playlistCount: r.playlist_count
  })));
}));

router.post('/artists', asyncHandler(async (req, res) => {
  const name = clean(req.body.name, 80);
  const officialUrl = String(req.body.officialUrl || '').trim();
  if (!name) return fail(res, '请填写音乐人名称', 400);
  assertAllowedUrl(officialUrl, '音乐人官方主页');

  const slug = clean(req.body.slug, 100) || createSlug(name);
  const dup = await query('SELECT id FROM artists WHERE slug = ? LIMIT 1', [slug]);
  if (dup.length) return fail(res, '该 slug 已存在', 409);

  const result = await query(
    `INSERT INTO artists (name, slug, avatar, country, genre, platform, official_url, bio, is_hot, sort, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, clean(req.body.avatar, 500), clean(req.body.country, 30), clean(req.body.genre, 60),
      clean(req.body.platform, 30), officialUrl, clean(req.body.bio, 500),
      req.body.isHot ? 1 : 0, Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1]
  );
  await bustContentCaches();
  return ok(res, { id: result.insertId, slug }, '创建成功');
}));

router.put('/artists/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const name = clean(req.body.name, 80);
  const officialUrl = String(req.body.officialUrl || '').trim();
  if (!name) return fail(res, '请填写音乐人名称', 400);
  assertAllowedUrl(officialUrl, '音乐人官方主页');

  await query(
    `UPDATE artists SET name = ?, slug = ?, avatar = ?, country = ?, genre = ?, platform = ?,
       official_url = ?, bio = ?, is_hot = ?, sort = ?, status = ? WHERE id = ?`,
    [name, clean(req.body.slug, 100) || createSlug(name), clean(req.body.avatar, 500),
      clean(req.body.country, 30), clean(req.body.genre, 60), clean(req.body.platform, 30), officialUrl,
      clean(req.body.bio, 500), req.body.isHot ? 1 : 0, Number(req.body.sort) || 0,
      req.body.status === 0 ? 0 : 1, id]
  );
  await bustContentCaches();
  return ok(res, { id }, '已保存');
}));

router.delete('/artists/:id', adminOnly, asyncHandler(async (req, res) => {
  await query('DELETE FROM artists WHERE id = ?', [parseInt(req.params.id, 10)]);
  await bustContentCaches();
  return ok(res, null, '已删除');
}));

/* ========================= Banner ========================= */

router.get('/banners', asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT * FROM banners ORDER BY position ASC, sort ASC, id DESC`
  );
  return ok(res, rows.map((b) => ({
    id: b.id, title: b.title, subtitle: b.subtitle, badge: b.badge, image: b.image,
    theme: b.theme, linkType: b.link_type, linkValue: b.link_value, position: b.position,
    sort: b.sort, status: b.status, startAt: b.start_at, endAt: b.end_at
  })));
}));

router.post('/banners', asyncHandler(async (req, res) => {
  const title = clean(req.body.title, 100);
  if (!title) return fail(res, '请填写 Banner 标题', 400);
  const result = await query(
    `INSERT INTO banners (title, subtitle, badge, image, theme, link_type, link_value, position, sort, status, start_at, end_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, clean(req.body.subtitle, 200), clean(req.body.badge, 30), clean(req.body.image, 500),
      clean(req.body.theme, 20) || 'indigo',
      ['playlist', 'artist', 'category', 'none'].includes(req.body.linkType) ? req.body.linkType : 'none',
      clean(req.body.linkValue, 120),
      req.body.position === 'home_middle' ? 'home_middle' : 'home_hero',
      Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1,
      req.body.startAt || null, req.body.endAt || null]
  );
  await bustContentCaches();
  return ok(res, { id: result.insertId }, '创建成功');
}));

router.put('/banners/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const title = clean(req.body.title, 100);
  if (!title) return fail(res, '请填写 Banner 标题', 400);
  await query(
    `UPDATE banners SET title = ?, subtitle = ?, badge = ?, image = ?, theme = ?, link_type = ?,
       link_value = ?, position = ?, sort = ?, status = ?, start_at = ?, end_at = ? WHERE id = ?`,
    [title, clean(req.body.subtitle, 200), clean(req.body.badge, 30), clean(req.body.image, 500),
      clean(req.body.theme, 20) || 'indigo',
      ['playlist', 'artist', 'category', 'none'].includes(req.body.linkType) ? req.body.linkType : 'none',
      clean(req.body.linkValue, 120),
      req.body.position === 'home_middle' ? 'home_middle' : 'home_hero',
      Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1,
      req.body.startAt || null, req.body.endAt || null, id]
  );
  await bustContentCaches();
  return ok(res, { id }, '已保存');
}));

router.delete('/banners/:id', adminOnly, asyncHandler(async (req, res) => {
  await query('DELETE FROM banners WHERE id = ?', [parseInt(req.params.id, 10)]);
  await bustContentCaches();
  return ok(res, null, '已删除');
}));

module.exports = router;
