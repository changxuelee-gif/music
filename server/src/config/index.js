'use strict';

/**
 * 全局配置：统一从环境变量读取，避免业务代码散落 process.env
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const toInt = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
const toList = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  // 站点对外域名，用于 sitemap / og:url / 分享链接
  siteUrl: process.env.SITE_URL || 'https://music.tengxiangtech.com',
  webDist: process.env.WEB_DIST || '../web/dist',
  corsOrigins: toList(process.env.CORS_ORIGIN),

  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: toInt(process.env.MYSQL_PORT, 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fenghuang_music',
    connectionLimit: toInt(process.env.MYSQL_CONNECTION_LIMIT, 10)
  },

  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: toInt(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: toInt(process.env.REDIS_DB, 0)
  },
  cache: {
    homeTtl: toInt(process.env.CACHE_TTL_HOME, 180),
    listTtl: toInt(process.env.CACHE_TTL_LIST, 120)
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-change-me',
    expires: process.env.JWT_EXPIRES || '2h',
    userExpires: process.env.JWT_USER_EXPIRES || '7d'
  },

  // 开放 API 鉴权 Key（留空则不开放接口）
  openApiKey: process.env.OPEN_API_KEY || '',

  oss: {
    region: process.env.OSS_REGION || '',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.OSS_BUCKET || '',
    publicHost: process.env.OSS_PUBLIC_HOST || ''
  },

  upload: {
    maxMb: toInt(process.env.UPLOAD_MAX_MB, 5),
    // 未配置 OSS 时的本地兜底目录（同时由 Express 静态托管到 /uploads）
    localDir: path.resolve(__dirname, '../../uploads')
  },

  // 合规：歌曲跳转链接允许的正版平台域名
  allowedMusicDomains: toList(process.env.ALLOWED_MUSIC_DOMAINS).length
    ? toList(process.env.ALLOWED_MUSIC_DOMAINS)
    : ['y.qq.com', 'qqmusic.qq.com', 'music.163.com', 'kugou.com', 'kuwo.cn', 'qishui.douyin.com', 'music.douyin.com', 'migu.cn']
};

module.exports = config;
