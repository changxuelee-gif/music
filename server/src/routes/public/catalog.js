'use strict';

/**
 * 歌单 / 音乐人 / 搜索 公共接口
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const redis = require('../../config/redis');
const config = require('../../config');
const { ok, paged, asyncHandler } = require('../../utils/response');
const { parsePagination, stableKey } = require('../../utils/helpers');
const { listPlaylists, getPlaylistBySlug, increaseView } = require('../../services/playlistService');
const { PLATFORM_LABEL } = require('../../services/playlistService');

/** 歌单列表（支持风格/场景/语种/标签多选/排序/分页） */
router.get('/playlists', asyncHandler(async (req, res) => {
  const { page, pageSize } = parsePagination(req.query, 12, 48);
  const opts = {
    category: req.query.category ? String(req.query.category).slice(0, 80) : undefined,
    scene: req.query.scene ? String(req.query.scene).slice(0, 80) : undefined,
    language: req.query.language ? String(req.query.language).slice(0, 80) : undefined,
    tags: req.query.tags ? String(req.query.tags).slice(0, 120) : undefined,
    sort: ['hot', 'new', 'click', 'default'].includes(req.query.sort) ? req.query.sort : 'default',
    page,
    pageSize
  };

  // 只对无关键词的列表做缓存
  const cacheKey = stableKey('playlist:list', opts);
  const cached = await redis.get(cacheKey);
  if (cached) return paged(res, cached);

  const result = await listPlaylists(opts);
  await redis.set(cacheKey, result, config.cache.listTtl);
  return paged(res, result);
}));

/** 歌单详情：返回歌曲元数据 + 正版平台跳转链接 */
router.get('/playlists/:slug', asyncHandler(async (req, res) => {
  const slug = String(req.params.slug).slice(0, 120);
  const cacheKey = `playlist:detail:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    increaseView(cached.id); // 浏览量真实累加，缓存仅影响展示延迟
    return ok(res, cached);
  }

  const data = await getPlaylistBySlug(slug);
  if (!data) return res.status(404).json({ code: 404, message: '歌单不存在或已下架', data: null });

  await redis.set(cacheKey, data, config.cache.listTtl);
  increaseView(data.id);
  return ok(res, data);
}));

/** 音乐人列表 */
router.get('/artists', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query, 12, 48);
  const where = ['status = 1'];
  const params = [];
  if (req.query.genre) {
    where.push('genre LIKE ?');
    params.push(`%${String(req.query.genre).slice(0, 40)}%`);
  }
  if (req.query.keyword) {
    where.push('(name LIKE ? OR genre LIKE ? OR bio LIKE ?)');
    const like = `%${String(req.query.keyword).slice(0, 40)}%`;
    params.push(like, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const totalRows = await query(`SELECT COUNT(*) AS total FROM artists ${whereSql}`, params);
  const rows = await query(
    `SELECT id, name, slug, avatar, country, genre, platform, official_url, bio, is_hot, sort
     FROM artists ${whereSql} ORDER BY sort ASC, id ASC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return paged(res, {
    list: rows.map((a) => ({
      id: a.id, name: a.name, slug: a.slug, avatar: a.avatar, country: a.country,
      genre: a.genre, platform: a.platform, officialUrl: a.official_url,
      bio: a.bio, isHot: Boolean(a.is_hot)
    })),
    total: totalRows[0]?.total || 0,
    page,
    pageSize
  });
}));

/** 音乐人详情 + 关联歌单 */
router.get('/artists/:slug', asyncHandler(async (req, res) => {
  const slug = String(req.params.slug).slice(0, 100);
  const rows = await query(
    `SELECT id, name, slug, avatar, country, genre, platform, official_url, bio, is_hot
     FROM artists WHERE slug = ? AND status = 1 LIMIT 1`,
    [slug]
  );
  if (!rows.length) return res.status(404).json({ code: 404, message: '音乐人不存在', data: null });

  const artist = rows[0];
  const playlists = await query(
    `SELECT DISTINCT p.id, p.title, p.slug, p.cover, p.summary, p.is_featured, p.sort,
            (SELECT COUNT(*) FROM songs s2 WHERE s2.playlist_id = p.id AND s2.status = 1) AS song_count
     FROM playlists p JOIN songs s ON s.playlist_id = p.id
     WHERE p.status = 1 AND s.status = 1 AND s.artist_id = ?
     ORDER BY p.is_featured DESC, p.sort ASC LIMIT 6`,
    [artist.id]
  );

  const related = await query(
    `SELECT id, name, slug, avatar, genre FROM artists
     WHERE status = 1 AND id <> ? AND genre LIKE CONCAT('%', SUBSTRING_INDEX(?, '/', 1), '%')
     ORDER BY is_hot DESC, sort ASC LIMIT 4`,
    [artist.id, artist.genre || '']
  );

  return ok(res, {
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    avatar: artist.avatar,
    country: artist.country,
    genre: artist.genre,
    platform: artist.platform,
    officialUrl: artist.official_url,
    bio: artist.bio,
    isHot: Boolean(artist.is_hot),
    playlists: playlists.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover,
      summary: p.summary, songCount: p.song_count, isFeatured: Boolean(p.is_featured)
    })),
    related: related.map((a) => ({ id: a.id, name: a.name, slug: a.slug, avatar: a.avatar, genre: a.genre }))
  });
}));

/** 全站搜索：歌单 / 歌曲 / 音乐人 / 标签（MySQL 检索，不接第三方） */
router.get('/search', asyncHandler(async (req, res) => {
  const keyword = String(req.query.q || '').trim().slice(0, 40);
  const { page, pageSize, offset } = parsePagination(req.query, 8, 40);

  if (!keyword) return ok(res, { keyword: '', playlists: [], songs: [], artists: [], tags: [], total: 0 });

  const like = `%${keyword}%`;

  const playlistWhere = `WHERE p.status = 1 AND (
    p.title LIKE ? OR p.summary LIKE ? OR p.description LIKE ?
    OR EXISTS (SELECT 1 FROM songs s WHERE s.playlist_id = p.id AND (s.title LIKE ? OR s.artist_name LIKE ?))
    OR EXISTS (SELECT 1 FROM playlist_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.playlist_id = p.id AND t.name LIKE ?)
    OR EXISTS (SELECT 1 FROM categories c WHERE c.id IN (p.category_id, p.scene_id, p.language_id) AND c.name LIKE ?)
  )`;

  const [playlistTotal, playlistRows, songRows, artistRows, tagRows] = await Promise.all([
    query(`SELECT COUNT(*) AS total FROM playlists p ${playlistWhere}`, [like, like, like, like, like, like, like]),
    query(
      `SELECT p.id, p.title, p.slug, p.cover, p.summary, p.song_count, p.is_featured, p.is_hot
       FROM playlists p ${playlistWhere}
       ORDER BY p.is_featured DESC, p.click_count DESC, p.sort ASC LIMIT ? OFFSET ?`,
      [like, like, like, like, like, like, like, pageSize, offset]
    ),
    query(
      `SELECT s.id, s.title, s.artist_name, s.platform, s.url, s.playlist_id,
              p.title AS playlist_title, p.slug AS playlist_slug
       FROM songs s JOIN playlists p ON p.id = s.playlist_id
       WHERE s.status = 1 AND p.status = 1 AND (s.title LIKE ? OR s.artist_name LIKE ?)
       ORDER BY s.id DESC LIMIT 10`,
      [like, like]
    ),
    query(
      `SELECT id, name, slug, avatar, genre FROM artists
       WHERE status = 1 AND (name LIKE ? OR genre LIKE ?) ORDER BY is_hot DESC, sort ASC LIMIT 6`,
      [like, like]
    ),
    query(`SELECT id, name, slug, color FROM tags WHERE status = 1 AND name LIKE ? LIMIT 10`, [like])
  ]);

  const total = playlistTotal[0]?.total || 0;

  // 搜索日志（异步写入，失败不影响结果）
  query('INSERT INTO search_logs (keyword, result_count, ip) VALUES (?, ?, ?)', [keyword, total, req.ip])
    .catch(() => {});

  return ok(res, {
    keyword,
    total,
    page,
    pageSize,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    playlists: playlistRows.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover, summary: p.summary,
      songCount: p.song_count, isHot: Boolean(p.is_hot)
    })),
    songs: songRows.map((s) => ({
      id: s.id, title: s.title, artistName: s.artist_name, platform: s.platform,
      platformLabel: PLATFORM_LABEL[s.platform] || '正版平台', url: s.url,
      playlistId: s.playlist_id, playlistTitle: s.playlist_title, playlistSlug: s.playlist_slug
    })),
    artists: artistRows.map((a) => ({ id: a.id, name: a.name, slug: a.slug, avatar: a.avatar, genre: a.genre })),
    tags: tagRows
  });
}));

/** 热门搜索词（近 7 天真实搜索 + 配置兜底） */
router.get('/search/hot', asyncHandler(async (req, res) => {
  const cacheKey = 'home:search-hot:v1';
  const cached = await redis.get(cacheKey);
  if (cached) return ok(res, cached);

  const rows = await query(
    `SELECT keyword, COUNT(*) AS cnt FROM search_logs
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY keyword ORDER BY cnt DESC LIMIT 10`
  );
  const list = rows.map((r) => ({ word: r.keyword, count: r.cnt }));
  await redis.set(cacheKey, list, 300);
  return ok(res, list);
}));

module.exports = router;
