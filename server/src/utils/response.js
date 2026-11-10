'use strict';

/** 统一响应结构：{ code, message, data }，code=0 表示成功 */
function ok(res, data = null, message = 'ok') {
  return res.json({ code: 0, message, data });
}

function fail(res, message = '请求失败', status = 400, code = status) {
  return res.status(status).json({ code, message, data: null });
}

/** 分页响应：data { list, total, page, pageSize, totalPages, ...额外字段 } */
function paged(res, payload) {
  const { list, total, page, pageSize, ...extra } = payload;
  return ok(res, {
    list,
    total,
    page,
    pageSize,
    totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 0,
    ...extra
  });
}

/** 业务错误：由全局 errorHandler 统一捕获 */
class AppError extends Error {
  constructor(message, status = 400, code = status) {
    super(message);
    this.status = status;
    this.code = code;
    this.expose = true;
  }
}

/** async 路由包装，免去每个 handler 写 try/catch */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ok, fail, paged, AppError, asyncHandler };
