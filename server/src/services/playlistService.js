'use strict';

/**
 * 歌单服务：列表、详情、标签、搜索
 * 合规约束：返回给前端的只有元数据与正版平台外链，绝不包含音频/歌词字段
 */
const { query } = require('../config/db');
const { parseIdList } = require('../utils/helpers');

const PLATFORM_LABEL = {
  qq: 'QQ音乐',
  netease: '网易云音乐',
  kugou: '酷狗音乐',
  qishui: '汽水音乐',
  kuwo: '酷我音乐',
  migu: '咪咕音乐'
};

function formatPlaylist(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    cover: row.cover,
    summary: row.summary,
    description: row.description,
    curator: row.curator,
    songCount: row.song_count,
    viewCount: row.view_count,
    clickCount: row.click_count,
    favoriteCount: row.favorite_count,
    isFeatured: Boolean(row.is_featured),
    isHot: Boolean(row.is_hot),
    isNew: Boolean(row.is_new),
    category: row.category_name
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
    scene: row.scene_name ? { id: row.scene_id, name: row.scene_name, slug: row.scene_slug } : null,
    language: row.language_name ? { id: row.language_id, name: row.language_name, slug: row.language_slug } : null,
    tags: row.tags || [],
    publishedAt: row.published_at,
    createdAt: row.created_at
  };
}

/** 批量补齐标签，避免 N+1 查询 */
async function attachTags(rows) {
  if (!rows.length) return rows;
  const ids = rows.map((r) => r.id);
  const tagRows = await query(
    `SELECT pt.playlist_id, t.id, t.name, t.slug, t.color
     FROM playlist_tags pt JOIN tags t ON t.id = pt.tag_id
     WHERE pt.playlist_id IN (?) AND t.status = 1
     ORDER BY t.sort ASC`,
    [ids]
  );
  const map = new Map();
  tagRows.forEach((t) => {
    if (!map.has(t.playlist_id)) map.set(t.playlist_id, []);
    map.get(t.playlist_id).push({ id: t.id, name: t.name, slug: t.slug, color: t.color });
  });
  rows.forEach((r) => { r.tags = map.get(r.id) || []; });
  return rows;
}

const BASE_SELECT = `
  SELECT p.id, p.title, p.slug, p.cover, p.summary, p.description, p.curator,
         (SELECT COUNT(*) FROM songs s WHERE s.playlist_id = p.id AND s.status = 1) AS song_count,
         p.view_count, p.click_count, p.favorite_count,
         p.is_featured, p.is_hot, p.is_new, p.status, p.sort, p.published_at, p.created_at,
         c.name AS category_name, c.slug AS category_slug, c.id AS category_id,
         sc.name AS scene_name, sc.slug AS scene_slug,
         lg.name AS language_name, lg.slug AS language_slug
  FROM playlists p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN categories sc ON sc.id = p.scene_id
  LEFT JOIN categories lg ON lg.id = p.language_id
`;

const SORT_MAP = {
  hot: 'p.is_hot DESC, p.click_count DESC, p.view_count DESC, p.sort ASC',
  new: 'p.published_at DESC, p.id DESC',
  click: 'p.click_count DESC, p.id DESC',
  default: 'p.sort ASC, p.id DESC'
};

/**
 * 歌单列表（公开）
 * @param {object} opts category/scene/language(slug), tags(id 数组), keyword, sort, page, pageSize, featured/hot/new
 */
async function listPlaylists(opts = {}) {
  const { page = 1, pageSize = 12 } = opts;
  const where = ['p.status = 1'];
  const params = [];

  if (opts.category) {
    where.push('c.slug = ?');
    params.push(opts.category);
  }
  if (opts.scene) {
    where.push('sc.slug = ?');
    params.push(opts.scene);
  }
  if (opts.language) {
    where.push('lg.slug = ?');
    params.push(opts.language);
  }
  if (opts.featured) where.push('p.is_featured = 1');
  if (opts.hot) where.push('p.is_hot = 1');
  if (opts.isNew) where.push('p.is_new = 1');

  const tagIds = parseIdList(opts.tags);
  tagIds.forEach((tagId) => {
    where.push('EXISTS (SELECT 1 FROM playlist_tags pt WHERE pt.playlist_id = p.id AND pt.tag_id = ?)');
    params.push(tagId);
  });

  if (opts.keyword) {
    const like = `%${opts.keyword}%`;
    where.push(`(
      p.title LIKE ? OR p.summary LIKE ? OR c.name LIKE ? OR sc.name LIKE ?
      OR EXISTS (SELECT 1 FROM songs s WHERE s.playlist_id = p.id AND (s.title LIKE ? OR s.artist_name LIKE ?))
      OR EXISTS (SELECT 1 FROM playlist_tags pt2 JOIN tags t2 ON t2.id = pt2.tag_id
                 WHERE pt2.playlist_id = p.id AND t2.name LIKE ?)
    )`);
    params.push(like, like, like, like, like, like, like);
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;
  const orderSql = SORT_MAP[opts.sort] || SORT_MAP.default;

  const countRows = await query(
    `SELECT COUNT(DISTINCT p.id) AS total FROM playlists p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN categories sc ON sc.id = p.scene_id
     LEFT JOIN categories lg ON lg.id = p.language_id
     ${whereSql}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const offset = (page - 1) * pageSize;
  const rows = await query(
    `${BASE_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  await attachTags(rows);

  return { list: rows.map(formatPlaylist), total, page, pageSize };
}

/** 歌单详情（含歌曲条目与标签） */
async function getPlaylistBySlug(slug) {
  const rows = await query(`${BASE_SELECT} WHERE p.slug = ? AND p.status = 1 LIMIT 1`, [slug]);
  if (!rows.length) return null;

  const row = rows[0];
  await attachTags(rows);

  const songs = await query(
    `SELECT id, title, artist_name, artist_id, platform, url, cover, duration, sort
     FROM songs WHERE playlist_id = ? AND status = 1 ORDER BY sort ASC, id ASC`,
    [row.id]
  );

  // 相关推荐：同风格或同场景，排除自身
  const relatedRows = await query(
    `${BASE_SELECT}
     WHERE p.status = 1 AND p.id <> ?
       AND (p.category_id = ? OR p.scene_id = ?)
     ORDER BY p.is_featured DESC, p.sort ASC LIMIT 4`,
    [row.id, row.category_id, row.scene_id]
  );
  await attachTags(relatedRows);

  return {
    ...formatPlaylist(row),
    songs: songs.map((s) => ({
      id: s.id,
      title: s.title,
      artistName: s.artist_name,
      artistId: s.artist_id,
      platform: s.platform,
      platformLabel: PLATFORM_LABEL[s.platform] || '正版平台',
      // 外链在写入时已通过白名单校验，这里原样输出
      url: s.url,
      cover: s.cover,
      duration: s.duration
    })),
    related: relatedRows.map(formatPlaylist)
  };
}

/** 记录详情页浏览（异步、失败不影响主流程） */
async function increaseView(id) {
  try {
    await query('UPDATE playlists SET view_count = view_count + 1 WHERE id = ?', [id]);
  } catch (e) {
    console.error('[playlist] increase view failed:', e.message);
  }
}

module.exports = { listPlaylists, getPlaylistBySlug, increaseView, formatPlaylist, PLATFORM_LABEL, attachTags, BASE_SELECT };
