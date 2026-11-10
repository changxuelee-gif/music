'use strict';

/**
 * 首页聚合服务：
 * 一次请求返回首页所有分区数据，配合 Redis 缓存降低数据库压力
 */
const { query } = require('../config/db');
const redis = require('../config/redis');
const config = require('../config');
const { listPlaylists, formatPlaylist } = require('./playlistService');

const HOME_KEY = 'home:index:v1';

async function getCategoriesWithCount(type, limit = 8) {
  const rows = await query(
    `SELECT c.id, c.name, c.slug, c.type, c.icon, c.color, c.intro, c.sort,
       (SELECT COUNT(*) FROM playlists p
        WHERE p.status = 1 AND (p.category_id = c.id OR p.scene_id = c.id OR p.language_id = c.id)) AS playlist_count
     FROM categories c
     WHERE c.type = ? AND c.status = 1
     ORDER BY c.sort ASC LIMIT ?`,
    [type, limit]
  );
  return rows.map((r) => ({
    id: r.id, name: r.name, slug: r.slug, type: r.type, icon: r.icon,
    color: r.color, intro: r.intro, playlistCount: r.playlist_count
  }));
}

async function getBanners() {
  const rows = await query(
    `SELECT id, title, subtitle, badge, image, theme, link_type, link_value
     FROM banners
     WHERE status = 1 AND position = 'home_hero'
       AND (start_at IS NULL OR start_at <= NOW())
       AND (end_at IS NULL OR end_at >= NOW())
     ORDER BY sort ASC, id DESC LIMIT 5`
  );
  return rows.map((r) => ({
    id: r.id, title: r.title, subtitle: r.subtitle, badge: r.badge,
    image: r.image, theme: r.theme,
    linkType: r.link_type, linkValue: r.link_value
  }));
}

async function getHomeData() {
  const cached = await redis.get(HOME_KEY);
  if (cached) return cached;

  const [banners, featured, styles, scenes, languages, hot, latest, artists] = await Promise.all([
    getBanners(),
    listPlaylists({ featured: true, pageSize: 6, sort: 'default' }),
    getCategoriesWithCount('style', 8),
    getCategoriesWithCount('scene', 6),
    getCategoriesWithCount('language', 4),
    listPlaylists({ hot: true, pageSize: 6, sort: 'hot' }),
    listPlaylists({ isNew: true, pageSize: 8, sort: 'new' }),
    query(
      `SELECT id, name, slug, avatar, country, genre, platform, official_url, bio, is_hot, sort
       FROM artists WHERE status = 1 AND is_hot = 1 ORDER BY sort ASC LIMIT 8`
    )
  ]);

  const data = {
    banners,
    featured: featured.list,
    styles,
    scenes,
    languages,
    hot: hot.list,
    latest: latest.list,
    artists: artists.map((a) => ({
      id: a.id, name: a.name, slug: a.slug, avatar: a.avatar, country: a.country,
      genre: a.genre, platform: a.platform, officialUrl: a.official_url,
      bio: a.bio, isHot: Boolean(a.is_hot)
    }))
  };

  await redis.set(HOME_KEY, data, config.cache.homeTtl);
  return data;
}

module.exports = { getHomeData, getCategoriesWithCount };
