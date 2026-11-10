'use strict';

/**
 * 收藏（需登录）：歌单 / 音乐人
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const { ok, fail, paged, asyncHandler } = require('../../utils/response');
const { userAuth } = require('../../middlewares/auth');
const { parsePagination } = require('../../utils/helpers');

router.use(userAuth);

/** 我的收藏 */
router.get('/', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query, 12, 40);

  const playlistRows = await query(
    `SELECT f.id, f.created_at, p.id AS target_id, p.title, p.slug, p.cover, p.summary,
            (SELECT COUNT(*) FROM songs s WHERE s.playlist_id = p.id AND s.status = 1) AS song_count
     FROM favorites f JOIN playlists p ON p.id = f.target_id
     WHERE f.user_id = ? AND f.target_type = 'playlist' AND p.status = 1
     ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    [req.user.id, pageSize, offset]
  );
  const artistRows = await query(
    `SELECT f.id, f.created_at, a.id AS target_id, a.name, a.slug, a.avatar, a.genre
     FROM favorites f JOIN artists a ON a.id = f.target_id
     WHERE f.user_id = ? AND f.target_type = 'artist' AND a.status = 1
     ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    [req.user.id, pageSize, offset]
  );
  const counts = await query(
    `SELECT target_type, COUNT(*) AS cnt FROM favorites WHERE user_id = ? GROUP BY target_type`,
    [req.user.id]
  );
  const total = counts.reduce((sum, c) => sum + c.cnt, 0);

  return paged(res, {
    list: [],
    total,
    page,
    pageSize,
    playlists: playlistRows.map((r) => ({
      id: r.id,
      targetId: r.target_id,
      title: r.title,
      slug: r.slug,
      cover: r.cover,
      summary: r.summary,
      songCount: r.song_count,
      createdAt: r.created_at
    })),
    artists: artistRows.map((r) => ({
      id: r.id,
      targetId: r.target_id,
      name: r.name,
      slug: r.slug,
      avatar: r.avatar,
      genre: r.genre,
      createdAt: r.created_at
    })),
    summary: counts.reduce((acc, c) => { acc[c.target_type] = c.cnt; return acc; }, {})
  });
}));

/** 新增收藏 */
router.post('/', asyncHandler(async (req, res) => {
  const targetType = req.body.targetType;
  const targetId = parseInt(req.body.targetId, 10);
  if (!['playlist', 'artist'].includes(targetType) || !targetId) {
    return fail(res, '收藏参数不合法', 400);
  }

  const table = targetType === 'playlist' ? 'playlists' : 'artists';
  const exists = await query(`SELECT id FROM ${table} WHERE id = ? AND status = 1 LIMIT 1`, [targetId]);
  if (!exists.length) return fail(res, '收藏对象不存在', 404);

  const result = await query(
    'INSERT IGNORE INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)',
    [req.user.id, targetType, targetId]
  );
  // 重复收藏不重复累加计数
  if (targetType === 'playlist' && result.affectedRows > 0) {
    await query('UPDATE playlists SET favorite_count = favorite_count + 1 WHERE id = ?', [targetId]);
  }
  return ok(res, { favorited: true }, '已收藏');
}));

/** 取消收藏 */
router.delete('/', asyncHandler(async (req, res) => {
  const targetType = req.query.targetType || req.body.targetType;
  const targetId = parseInt(req.query.targetId || req.body.targetId, 10);
  if (!['playlist', 'artist'].includes(targetType) || !targetId) {
    return fail(res, '参数不合法', 400);
  }

  const result = await query(
    'DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
    [req.user.id, targetType, targetId]
  );
  if (result.affectedRows && targetType === 'playlist') {
    await query('UPDATE playlists SET favorite_count = GREATEST(favorite_count - 1, 0) WHERE id = ?', [targetId]);
  }
  return ok(res, { favorited: false }, '已取消收藏');
}));

/** 检查收藏状态 */
router.get('/check', asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  const rows = await query(
    'SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ? LIMIT 1',
    [req.user.id, targetType, parseInt(targetId, 10)]
  );
  return ok(res, { favorited: rows.length > 0 });
}));

module.exports = router;
