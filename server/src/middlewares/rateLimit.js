'use strict';

/**
 * 限流：内存实现（单机足够；多机部署建议换成 rate-limit-redis 存储）
 */
const rateLimit = require('express-rate-limit');
const { fail } = require('../utils/response');

const handler = (req, res) =>
  fail(res, '请求过于频繁，请稍后再试', 429);

// 全站基础限流
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

// 登录接口（防止撞库）
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

// 投诉提交（防刷单）
const complaintLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

// 埋点上报（前端节流后仍可能较多）
const statsLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

// 上传
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler
});

module.exports = { globalLimiter, authLimiter, complaintLimiter, statsLimiter, uploadLimiter };
