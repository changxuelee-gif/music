'use strict';

/**
 * 数据看板：访问统计 / 热门搜索 / 歌单点击 / 平台分布
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const { ok, asyncHandler } = require('../../utils/response');
const { adminAuth } = require('../../middlewares/auth');

router.use(adminAuth);

router.get('/dashboard/overview', asyncHandler(async (req, res) => {
  const [
    todayPvRows, yesterdayPvRows, trendRows, totals, pendingRows,
    topPlaylists, hotKeywords, platformRows, recentComplaints
  ] = await Promise.all([
    query(`SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visit_logs WHERE created_at >= CURDATE()`),
    query(`SELECT COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv FROM visit_logs
           WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND created_at < CURDATE()`),
    query(`SELECT DATE(created_at) AS d, COUNT(*) AS pv, COUNT(DISTINCT visitor_id) AS uv
           FROM visit_logs WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
           GROUP BY DATE(created_at) ORDER BY d ASC`),
    query(`SELECT
             (SELECT COUNT(*) FROM playlists WHERE status = 1) AS playlists,
             (SELECT COUNT(*) FROM songs WHERE status = 1) AS songs,
             (SELECT COUNT(*) FROM artists WHERE status = 1) AS artists,
             (SELECT COUNT(*) FROM users WHERE role = 'user') AS users,
             (SELECT COUNT(*) FROM complaints) AS complaints`),
    query(`SELECT COUNT(*) AS pending FROM complaints WHERE status = 'pending'`),
    query(`SELECT id, title, slug, cover, view_count, click_count, favorite_count, song_count
           FROM playlists WHERE status = 1 ORDER BY click_count DESC, view_count DESC LIMIT 8`),
    query(`SELECT keyword, COUNT(*) AS cnt FROM search_logs
           WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
           GROUP BY keyword ORDER BY cnt DESC LIMIT 10`),
    query(`SELECT platform, COUNT(*) AS cnt FROM song_clicks
           WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY platform ORDER BY cnt DESC`),
    query(`SELECT id, ticket_no, name, type, status, created_at FROM complaints
           ORDER BY created_at DESC LIMIT 5`)
  ]);

  // 补齐最近 7 天日期，避免折线图断点
  const trendMap = new Map(trendRows.map((r) => [String(r.d).slice(0, 10), r]));
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const row = trendMap.get(key);
    trend.push({ date: key.slice(5), pv: row ? row.pv : 0, uv: row ? row.uv : 0 });
  }

  return ok(res, {
    today: { pv: todayPvRows[0].pv, uv: todayPvRows[0].uv },
    yesterday: { pv: yesterdayPvRows[0].pv, uv: yesterdayPvRows[0].uv },
    trend,
    totals: {
      playlists: totals[0].playlists,
      songs: totals[0].songs,
      artists: totals[0].artists,
      users: totals[0].users,
      complaints: totals[0].complaints,
      pendingComplaints: pendingRows[0].pending
    },
    topPlaylists: topPlaylists.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover,
      viewCount: p.view_count, clickCount: p.click_count,
      favoriteCount: p.favorite_count, songCount: p.song_count
    })),
    hotKeywords: hotKeywords.map((k) => ({ word: k.keyword, count: k.cnt })),
    platformDistribution: platformRows.map((p) => ({ platform: p.platform, count: p.cnt })),
    recentComplaints: recentComplaints.map((c) => ({
      id: c.id, ticketNo: c.ticket_no, name: c.name, type: c.type,
      status: c.status, createdAt: c.created_at
    }))
  });
}));

module.exports = router;
