'use strict';

/**
 * SEO 动态 meta 注入
 * SPA 本身是纯前端渲染，这里在服务端为歌单/音乐人/分类页替换 title、description、og 标签，
 * 保证搜索引擎与分享卡片拿到正确信息（不做 SSR，页面内容仍由前端渲染）。
 */
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { query } = require('../config/db');

const distIndex = path.resolve(__dirname, '../../', config.webDist, 'index.html');
let cache = { mtime: 0, html: '' };

function loadIndexHtml() {
  try {
    const stat = fs.statSync(distIndex);
    if (cache.mtime !== stat.mtimeMs || !cache.html) {
      cache = { mtime: stat.mtimeMs, html: fs.readFileSync(distIndex, 'utf8') };
    }
    return cache.html;
  } catch (e) {
    return null;
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const siteUrl = () => config.siteUrl.replace(/\/$/, '');

function absUrl(u) {
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `${siteUrl()}${u.startsWith('/') ? '' : '/'}${u}`;
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function inject(html, { title, description, keywords, image, url, structured }) {
  let out = html;
  // 后台录入的 seo_title 可能已包含品牌名，避免出现“声屿 - 声屿”
  const fullTitle = /声屿/.test(title) ? title : `${title} - 声屿音乐导航`;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);
  out = out.replace(
    /<meta name="description" content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(description || '')}" />`
  );
  if (keywords) {
    out = out.replace(
      /<meta name="keywords" content="[\s\S]*?"\s*\/?>/,
      `<meta name="keywords" content="${escapeHtml(keywords)}" />`
    );
  }
  if (url) {
    out = out.replace(/<link rel="canonical" href="[\s\S]*?"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(url)}" />`);
  }
  const ogImage = absUrl(image);
  const extra = [
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description || '')}" />`,
    `<meta property="og:type" content="website" />`,
    url ? `<meta property="og:url" content="${escapeHtml(url)}" />` : '',
    ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : '',
    structured ? jsonLd(structured) : ''
  ].filter(Boolean).join('\n    ');
  out = out.replace('</head>', `    ${extra}\n  </head>`);
  return out;
}

async function resolveMeta(pathname) {
  const playlistMatch = pathname.match(/^\/playlist\/([a-z0-9-]+)/i);
  if (playlistMatch) {
    const rows = await query(
      `SELECT p.title, p.summary, p.seo_title, p.seo_keywords, p.seo_desc, p.cover,
              (SELECT COUNT(*) FROM songs s WHERE s.playlist_id = p.id AND s.status = 1) AS track_count
       FROM playlists p WHERE p.slug = ? AND p.status = 1 LIMIT 1`,
      [playlistMatch[1]]
    );
    if (rows.length) {
      const p = rows[0];
      const url = `${siteUrl()}/playlist/${playlistMatch[1]}`;
      return {
        title: p.seo_title || p.title,
        description: p.seo_desc || p.summary,
        keywords: p.seo_keywords,
        image: p.cover,
        url,
        structured: {
          '@context': 'https://schema.org',
          '@type': 'MusicPlaylist',
          name: p.seo_title || p.title,
          description: p.seo_desc || p.summary || '',
          numTracks: p.track_count,
          url,
          image: absUrl(p.cover),
          about: '本页仅提供正版音乐平台官方页面跳转，不存储、不播放任何音频。'
        }
      };
    }
  }

  const artistMatch = pathname.match(/^\/artist\/([a-z0-9-]+)/i);
  if (artistMatch) {
    const rows = await query('SELECT name, genre, bio, avatar FROM artists WHERE slug = ? AND status = 1 LIMIT 1', [artistMatch[1]]);
    if (rows.length) {
      const a = rows[0];
      const url = `${siteUrl()}/artist/${artistMatch[1]}`;
      return {
        title: `${a.name} · 音乐人`,
        description: a.bio || `${a.name} 的音乐作品导航，直达正版音乐平台。`,
        keywords: `${a.name},${a.genre || '音乐人'},正版音乐`,
        image: a.avatar,
        url,
        structured: {
          '@context': 'https://schema.org',
          '@type': 'PerformingGroup',
          name: a.name,
          description: a.bio || '',
          url,
          image: absUrl(a.avatar)
        }
      };
    }
  }

  const categoryMatch = pathname.match(/^\/category\/([a-z0-9-]+)/i);
  if (categoryMatch) {
    const rows = await query(
      'SELECT name, intro, seo_title, seo_desc FROM categories WHERE slug = ? AND status = 1 LIMIT 1',
      [categoryMatch[1]]
    );
    if (rows.length) {
      const c = rows[0];
      const url = `${siteUrl()}/category/${categoryMatch[1]}`;
      return {
        title: c.seo_title || `${c.name}歌单`,
        description: c.seo_desc || c.intro || `${c.name}分类下的精选歌单`,
        url,
        structured: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: c.seo_title || `${c.name}歌单`,
          description: c.seo_desc || c.intro || '',
          url
        }
      };
    }
  }

  if (pathname === '/') {
    return {
      title: '声屿音乐导航 - 发现好音乐，直达正版音乐平台',
      description: '声屿是精品人工音乐导航站：按国风、流行、电子、民谣等风格，以及通勤、深夜、专注、运动等场景组织人工策展歌单，直达 QQ音乐、网易云音乐等正版平台。',
      keywords: '音乐导航,歌单推荐,正版音乐,国风歌单,流行歌单,纯音乐,通勤BGM',
      url: `${siteUrl()}/`,
      structured: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '声屿音乐导航',
        url: `${siteUrl()}/`,
        description: '精品人工音乐导航站，按风格、场景、音乐人组织歌单，直达正版音乐平台。',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl()}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string'
        }
      }
    };
  }

  return null;
}

/** Express 中间件：仅处理页面路由 */
async function seoInjector(req, res, next) {
  if (req.method !== 'GET' || req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  // 静态资源直接放行，不做 SEO 注入
  if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|map)$/i.test(req.path)) return next();

  const html = loadIndexHtml();
  if (!html) return next();

  try {
    const meta = await resolveMeta(req.path);
    if (!meta) return next();
    const base = config.siteUrl.replace(/\/$/, '');
    return res.type('html').send(inject(html, { ...meta, url: `${base}${req.path}` }));
  } catch (e) {
    return next();
  }
}

module.exports = { seoInjector, loadIndexHtml };
