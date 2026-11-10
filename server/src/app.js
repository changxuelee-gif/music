'use strict';

/**
 * Express 应用装配
 * 中间件顺序：安全头 → 压缩 → CORS → 解析 → 限流 → 埋点/业务路由 → SEO → 静态资源 → SPA 回退 → 错误处理
 */
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const { globalLimiter } = require('./middlewares/rateLimit');
const { notFound, errorHandler } = require('./middlewares/error');
const { seoInjector } = require('./middlewares/seoInjector');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// 安全响应头（CSP 由 Nginx 统一配置，避免与第三方图床/OSS 冲突）
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

// 跨域：仅在配置了 CORS_ORIGIN 时开启（同域部署无需跨域）
if (config.corsOrigins.length) {
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'));
    },
    credentials: false
  }));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// 全站 API 限流（静态资源不走）
app.use('/api', globalLimiter);

// 健康检查
app.get('/api/health', (req, res) => res.json({ code: 0, message: 'ok', data: { uptime: process.uptime() } }));

// 业务路由
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));

// SEO：sitemap / robots
app.use(require('./routes/seo'));

// 本地上传兜底目录（未配置 OSS 时）
app.use('/uploads', express.static(config.upload.localDir, { maxAge: '7d', fallthrough: true }));

// 前端静态资源 + 动态 meta 注入
const distDir = path.resolve(__dirname, '..', config.webDist);
app.use(seoInjector);
app.use(express.static(distDir, { index: false, maxAge: '1h' }));

// SPA 回退：非 API 的页面请求交给 Vue Router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexHtml = path.join(distDir, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(503).type('text/plain').send(
        '前端尚未构建。请先在 web 目录执行 npm install && npm run build，再启动后端服务。'
      );
    }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
