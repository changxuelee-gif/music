'use strict';

/** sitemap.xml / robots.txt：SEO 基础 */
const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const config = require('../config');

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = config.siteUrl.replace(/\/$/, '');
    const [playlists, artists, categories] = await Promise.all([
      query('SELECT slug, updated_at FROM playlists WHERE status = 1 ORDER BY id DESC LIMIT 2000'),
      query('SELECT slug, updated_at FROM artists WHERE status = 1 ORDER BY id DESC LIMIT 1000'),
      query('SELECT type, slug FROM categories WHERE status = 1')
    ]);

    const urls = [
      { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${base}/category`, priority: '0.8', changefreq: 'daily' },
      { loc: `${base}/artists`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${base}/search`, priority: '0.6', changefreq: 'daily' },
      { loc: `${base}/complaint`, priority: '0.3', changefreq: 'monthly' },
      ...categories.map((c) => ({ loc: `${base}/category/${c.slug}`, priority: '0.7', changefreq: 'weekly' })),
      ...playlists.map((p) => ({
        loc: `${base}/playlist/${p.slug}`,
        lastmod: String(p.updated_at).slice(0, 10),
        priority: '0.6',
        changefreq: 'weekly'
      })),
      ...artists.map((a) => ({ loc: `${base}/artist/${a.slug}`, priority: '0.5', changefreq: 'monthly' }))
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (e) {
    next(e);
  }
});

router.get('/robots.txt', (req, res) => {
  const base = config.siteUrl.replace(/\/$/, '');
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${base}/sitemap.xml
`);
});

module.exports = router;
