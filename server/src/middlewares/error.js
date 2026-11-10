'use strict';

/**
 * 统一错误处理 + 404
 */
const { fail } = require('../utils/response');

function notFound(req, res) {
  if (req.path.startsWith('/api/')) {
    return fail(res, '接口不存在', 404);
  }
  // 非 API 的未知路径交给前端路由（SPA fallback 在 app.js 中处理）
  return res.status(404).send('Not Found');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) {
    console.error('[error]', req.method, req.originalUrl, err);
  }
  const message = err.expose || status < 500 ? err.message : '服务器内部错误，请稍后再试';
  return fail(res, message, status, err.code || status);
}

module.exports = { notFound, errorHandler };
