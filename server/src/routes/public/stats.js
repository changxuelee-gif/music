'use strict';

/**
 * 访问埋点 & 歌曲跳转点击统计
 * - PV/UV：前端生成匿名 visitorId，仅用于统计
 * - 点击：仅记录 song_id / playlist_id / platform，不记录任何播放行为
 */
const express = require('express');
const router = express.Router();
const { query, transaction } = require('../../config/db');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { clean } = require('../../utils/xss');
const { getClientIp } = require('../../utils/helpers');
const { statsLimiter } = require('../../middlewares/rateLimit');

router.use(statsLimiter);

/** 页面访问上报 */
router.post('/visit', asyncHandler(async (req, res) => {
  const pathName = clean(req.body.path, 200);
  if (!pathName.startsWith('/')) return fail(res, '访问路径不合法', 400);

  const referer = clean(req.body.referer, 500);
  const visitorId = clean(req.body.visitorId, 64);
  const ua = String(req.headers['user-agent'] || '').slice(0, 300);

  await query(
    'INSERT INTO visit_logs (path, referer, ua, ip, visitor_id) VALUES (?, ?, ?, ?, ?)',
    [pathName, referer, ua, getClientIp(req), visitorId]
  );

  return ok(res, null, 'ok');
}));

/** 去收听点击上报（前端在打开新标签前调用，失败不阻塞跳转） */
router.post('/click', asyncHandler(async (req, res) => {
  const songId = parseInt(req.body.songId, 10);
  const playlistId = parseInt(req.body.playlistId, 10);
  if (!songId || !playlistId) return fail(res, '参数不合法', 400);

  const rows = await query(
    'SELECT id, playlist_id, platform FROM songs WHERE id = ? AND status = 1 LIMIT 1',
    [songId]
  );
  if (!rows.length || rows[0].playlist_id !== playlistId) {
    return fail(res, '歌曲条目不存在', 404);
  }

  await transaction(async (conn) => {
    await conn.query(
      'INSERT INTO song_clicks (song_id, playlist_id, platform, ip) VALUES (?, ?, ?, ?)',
      [songId, playlistId, rows[0].platform, getClientIp(req)]
    );
    await conn.query('UPDATE playlists SET click_count = click_count + 1 WHERE id = ?', [playlistId]);
  });

  return ok(res, null, 'ok');
}));

/** 站点访问统计（PV/UV） */
router.get('/overview', asyncHandler(async (req, res) => {
  const [today] = await query(
    `SELECT COUNT(*) as pv, COUNT(DISTINCT visitor_id) as uv FROM visit_logs WHERE DATE(created_at)=CURDATE()`
  );
  const [total] = await query(
    `SELECT COUNT(*) as pv, COUNT(DISTINCT visitor_id) as uv FROM visit_logs`
  );
  return ok(res, {
    todayPv: today.pv,
    todayUv: today.uv,
    totalPv: total.pv,
    totalUv: total.uv
  });
}));

module.exports = router;
