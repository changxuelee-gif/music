'use strict';

/** 通用工具：分页参数、slug、客户端 IP、工单号 */
const crypto = require('crypto');

function parsePagination(query, defaultSize = 12, maxSize = 60) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(maxSize, Math.max(1, parseInt(query.pageSize, 10) || defaultSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function parseIdList(input) {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(',');
  return arr
    .map((v) => parseInt(v, 10))
    .filter((v) => Number.isInteger(v) && v > 0)
    .slice(0, 30);
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? String(forwarded).split(',')[0] : req.ip) || '';
  return ip.replace(/^::ffff:/, '').slice(0, 45);
}

function createSlug(text) {
  const base = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base || 'item'}-${suffix}`.slice(0, 100);
}

function createTicketNo() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `CP${stamp}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

/** 生成 NEVER 缓存 key 的稳定指纹（用于列表缓存） */
function stableKey(prefix, obj) {
  const str = Object.keys(obj)
    .sort()
    .map((k) => `${k}=${obj[k]}`)
    .join('&');
  return `${prefix}:${crypto.createHash('md5').update(str).digest('hex')}`;
}

module.exports = { parsePagination, parseIdList, getClientIp, createSlug, createTicketNo, stableKey };
