'use strict';

/**
 * 后台歌单管理：CRUD + 歌曲条目 + 上下架
 * 合规：歌曲保存前强制白名单校验，禁止任何非正版平台外链
 */
const express = require('express');
const router = express.Router();
const { query, transaction } = require('../../config/db');
const { ok, fail, paged, asyncHandler } = require('../../utils/response');
const { adminAuth, adminOnly } = require('../../middlewares/auth');
const { assertAllowedUrl, isAllowedUrl } = require('../../middlewares/whitelist');
const { clean } = require('../../utils/xss');
const { createSlug, parsePagination } = require('../../utils/helpers');
const { bustContentCaches } = require('../../services/cache');

const PLATFORMS = ['qq', 'netease', 'kugou', 'qishui', 'kuwo', 'migu'];

/** 根据链接域名推断平台，避免录入错误 */
function detectPlatform(url) {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch (e) { return null; }
  if (host.includes('y.qq.com') || host.includes('qqmusic')) return 'qq';
  if (host.includes('163.com')) return 'netease';
  if (host.includes('kugou')) return 'kugou';
  if (host.includes('qishui') || host.includes('douyin')) return 'qishui';
  if (host.includes('kuwo')) return 'kuwo';
  if (host.includes('migu')) return 'migu';
  return null;
}

function normalizeSongs(rawSongs) {
  if (!Array.isArray(rawSongs)) return [];
  return rawSongs.slice(0, 200).map((s, index) => {
    const title = clean(s.title, 120);
    const artistName = clean(s.artistName, 120);
    const url = String(s.url || '').trim().slice(0, 500);
    if (!title || !artistName) throw Object.assign(new Error('歌曲名与歌手不能为空'), { status: 400, expose: true });
    assertAllowedUrl(url, '歌曲跳转链接');

    const platform = PLATFORMS.includes(s.platform) ? s.platform : detectPlatform(url);
    if (!platform || platform !== detectPlatform(url)) {
      throw Object.assign(new Error(`平台与链接不匹配：${title}`), { status: 400, expose: true });
    }

    return {
      title,
      artistName,
      artistId: parseInt(s.artistId, 10) || null,
      platform,
      url,
      cover: clean(s.cover, 500),
      duration: clean(s.duration, 10),
      sort: Number.isFinite(Number(s.sort)) ? Number(s.sort) : (index + 1) * 10,
      status: s.status === 0 ? 0 : 1
    };
  });
}

async function saveSongs(conn, playlistId, songs) {
  await conn.query('DELETE FROM songs WHERE playlist_id = ?', [playlistId]);
  for (const s of songs) {
    await conn.query(
      `INSERT INTO songs (playlist_id, title, artist_name, artist_id, platform, url, cover, duration, sort, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [playlistId, s.title, s.artistName, s.artistId, s.platform, s.url, s.cover, s.duration, s.sort, s.status]
    );
  }
  await conn.query('UPDATE playlists SET song_count = ? WHERE id = ?', [songs.filter((s) => s.status === 1).length, playlistId]);
}

/** 后台列表：含下架歌单 */
router.get('/playlists', adminAuth, asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query, 12, 60);
  const where = ['1 = 1'];
  const params = [];

  if (['0', '1'].includes(String(req.query.status))) {
    where.push('p.status = ?');
    params.push(Number(req.query.status));
  }
  if (req.query.keyword) {
    where.push('(p.title LIKE ? OR p.slug LIKE ?)');
    const like = `%${String(req.query.keyword).slice(0, 40)}%`;
    params.push(like, like);
  }
  if (req.query.categoryId) {
    where.push('p.category_id = ?');
    params.push(parseInt(req.query.categoryId, 10));
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const totalRows = await query(`SELECT COUNT(*) AS total FROM playlists p ${whereSql}`, params);
  const rows = await query(
    `SELECT p.id, p.title, p.slug, p.cover, p.summary, p.song_count, p.view_count, p.click_count,
            p.is_featured, p.is_hot, p.is_new, p.status, p.sort, p.updated_at,
            c.name AS category_name, s.name AS scene_name, l.name AS language_name
     FROM playlists p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN categories s ON s.id = p.scene_id
     LEFT JOIN categories l ON l.id = p.language_id
     ${whereSql} ORDER BY p.sort ASC, p.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return paged(res, {
    list: rows.map((r) => ({
      id: r.id, title: r.title, slug: r.slug, cover: r.cover, summary: r.summary,
      songCount: r.song_count, viewCount: r.view_count, clickCount: r.click_count,
      isFeatured: Boolean(r.is_featured), isHot: Boolean(r.is_hot), isNew: Boolean(r.is_new),
      status: r.status, sort: r.sort, categoryName: r.category_name,
      sceneName: r.scene_name, languageName: r.language_name, updatedAt: r.updated_at
    })),
    total: totalRows[0]?.total || 0,
    page,
    pageSize
  });
}));

/** 后台详情（含歌曲与标签，status 不限） */
router.get('/playlists/:id', adminAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rows = await query(
    `SELECT p.*, c.name AS category_name, s.name AS scene_name, l.name AS language_name
     FROM playlists p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN categories s ON s.id = p.scene_id
     LEFT JOIN categories l ON l.id = p.language_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows.length) return fail(res, '歌单不存在', 404);
  const p = rows[0];

  const songs = await query(
    `SELECT id, title, artist_name, artist_id, platform, url, cover, duration, sort, status
     FROM songs WHERE playlist_id = ? ORDER BY sort ASC, id ASC`,
    [id]
  );
  const tags = await query('SELECT tag_id FROM playlist_tags WHERE playlist_id = ?', [id]);

  return ok(res, {
    id: p.id, title: p.title, slug: p.slug, cover: p.cover, summary: p.summary,
    description: p.description, categoryId: p.category_id, sceneId: p.scene_id,
    languageId: p.language_id, curator: p.curator, isFeatured: Boolean(p.is_featured),
    isHot: Boolean(p.is_hot), isNew: Boolean(p.is_new), status: p.status, sort: p.sort,
    seoTitle: p.seo_title, seoKeywords: p.seo_keywords, seoDesc: p.seo_desc,
    songCount: p.song_count,
    tagIds: tags.map((t) => t.tag_id),
    songs: songs.map((s) => ({
      id: s.id, title: s.title, artistName: s.artist_name, artistId: s.artist_id,
      platform: s.platform, url: s.url, cover: s.cover, duration: s.duration,
      sort: s.sort, status: s.status
    }))
  });
}));

/** 新增歌单 */
router.post('/playlists', adminAuth, asyncHandler(async (req, res) => {
  const title = clean(req.body.title, 100);
  if (!title) return fail(res, '请填写歌单标题', 400);

  let slug = clean(req.body.slug, 120);
  if (slug && !/^[a-z0-9-]{2,120}$/.test(slug)) {
    return fail(res, 'slug 仅允许小写字母、数字与连字符', 400);
  }
  if (!slug) slug = createSlug(title);

  const dup = await query('SELECT id FROM playlists WHERE slug = ? LIMIT 1', [slug]);
  if (dup.length) return fail(res, '该 slug 已存在，请更换', 409);

  const songs = normalizeSongs(req.body.songs);
  const tagIds = (Array.isArray(req.body.tagIds) ? req.body.tagIds : []).map(Number).filter(Boolean).slice(0, 20);

  const playlistId = await transaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO playlists
        (title, slug, cover, summary, description, category_id, scene_id, language_id, curator,
         is_featured, is_hot, is_new, status, sort, seo_title, seo_keywords, seo_desc, created_by, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, slug, clean(req.body.cover, 500), clean(req.body.summary, 255), clean(req.body.description, 5000),
        parseInt(req.body.categoryId, 10) || null, parseInt(req.body.sceneId, 10) || null,
        parseInt(req.body.languageId, 10) || null, clean(req.body.curator, 50) || '声屿编辑部',
        req.body.isFeatured ? 1 : 0, req.body.isHot ? 1 : 0, req.body.isNew ? 1 : 0,
        req.body.status === 0 ? 0 : 1, Number(req.body.sort) || 0,
        clean(req.body.seoTitle, 200), clean(req.body.seoKeywords, 200), clean(req.body.seoDesc, 500),
        req.user.id, req.body.status === 0 ? null : new Date()
      ]
    );

    for (const tagId of tagIds) {
      await conn.query('INSERT IGNORE INTO playlist_tags (playlist_id, tag_id) VALUES (?, ?)', [result.insertId, tagId]);
    }
    await saveSongs(conn, result.insertId, songs);
    return result.insertId;
  });

  await bustContentCaches();
  return ok(res, { id: playlistId, slug }, '创建成功');
}));

/** 编辑歌单（songs/tagIds 传了才覆盖） */
router.put('/playlists/:id', adminAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exist = await query('SELECT id, status FROM playlists WHERE id = ? LIMIT 1', [id]);
  if (!exist.length) return fail(res, '歌单不存在', 404);

  const title = clean(req.body.title, 100);
  if (!title) return fail(res, '请填写歌单标题', 400);

  let slug = clean(req.body.slug, 120);
  if (!slug) slug = createSlug(title);
  const dup = await query('SELECT id FROM playlists WHERE slug = ? AND id <> ? LIMIT 1', [slug, id]);
  if (dup.length) return fail(res, '该 slug 已被其他歌单占用', 409);

  const songs = req.body.songs !== undefined ? normalizeSongs(req.body.songs) : null;
  const tagIds = Array.isArray(req.body.tagIds) ? req.body.tagIds.map(Number).filter(Boolean).slice(0, 20) : null;
  const status = req.body.status === 0 ? 0 : 1;

  await transaction(async (conn) => {
    await conn.query(
      `UPDATE playlists SET title = ?, slug = ?, cover = ?, summary = ?, description = ?,
        category_id = ?, scene_id = ?, language_id = ?, curator = ?,
        is_featured = ?, is_hot = ?, is_new = ?, status = ?, sort = ?,
        seo_title = ?, seo_keywords = ?, seo_desc = ?,
        published_at = IF(published_at IS NULL AND ? = 1, NOW(), published_at)
       WHERE id = ?`,
      [
        title, slug, clean(req.body.cover, 500), clean(req.body.summary, 255), clean(req.body.description, 5000),
        parseInt(req.body.categoryId, 10) || null, parseInt(req.body.sceneId, 10) || null,
        parseInt(req.body.languageId, 10) || null, clean(req.body.curator, 50) || '声屿编辑部',
        req.body.isFeatured ? 1 : 0, req.body.isHot ? 1 : 0, req.body.isNew ? 1 : 0,
        status, Number(req.body.sort) || 0,
        clean(req.body.seoTitle, 200), clean(req.body.seoKeywords, 200), clean(req.body.seoDesc, 500),
        status, id
      ]
    );

    if (tagIds) {
      await conn.query('DELETE FROM playlist_tags WHERE playlist_id = ?', [id]);
      for (const tagId of tagIds) {
        await conn.query('INSERT IGNORE INTO playlist_tags (playlist_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }
    if (songs) await saveSongs(conn, id, songs);
  });

  await bustContentCaches();
  return ok(res, { id, slug }, '保存成功');
}));

/** 上下架 */
router.patch('/playlists/:id/status', adminAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const status = req.body.status === 0 ? 0 : 1;
  await query(
    'UPDATE playlists SET status = ?, published_at = IF(? = 1 AND published_at IS NULL, NOW(), published_at) WHERE id = ?',
    [status, status, id]
  );
  await bustContentCaches();
  return ok(res, { id, status }, status ? '已上架' : '已下架');
}));

/** 删除（仅管理员） */
router.delete('/playlists/:id', adminOnly, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  await query('DELETE FROM playlists WHERE id = ?', [id]);
  await bustContentCaches();
  return ok(res, null, '已删除');
}));

/** 单条歌曲更新（便捷接口） */
router.put('/songs/:id', adminAuth, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const url = String(req.body.url || '').trim();
  assertAllowedUrl(url, '歌曲跳转链接');
  const platform = detectPlatform(url);
  if (!platform) return fail(res, '无法识别链接所属平台', 400);

  await query(
    `UPDATE songs SET title = ?, artist_name = ?, artist_id = ?, platform = ?, url = ?, cover = ?, duration = ?, sort = ?, status = ?
     WHERE id = ?`,
    [
      clean(req.body.title, 120), clean(req.body.artistName, 120), parseInt(req.body.artistId, 10) || null,
      platform, url, clean(req.body.cover, 500), clean(req.body.duration, 10),
      Number(req.body.sort) || 0, req.body.status === 0 ? 0 : 1, id
    ]
  );
  await bustContentCaches();
  return ok(res, null, '歌曲已更新');
}));

/** 白名单预检（后台录入时实时提示） */
router.post('/playlists/validate-url', adminAuth, asyncHandler(async (req, res) => {
  const url = String(req.body.url || '').trim();
  return ok(res, { allowed: isAllowedUrl(url), platform: detectPlatform(url) });
}));

module.exports = router;
