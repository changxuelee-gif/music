'use strict';

/**
 * XSS 防护：所有用户/后台输入在入库前必须清洗
 * - 纯文本字段：剥离全部 HTML 标签与危险协议
 * - 富文本暂不支持（歌单介绍统一按纯文本处理，前端以 white-space:pre-wrap 展示）
 */
const xss = require('xss');

const stripOptions = {
  whiteList: {},          // 不允许任何标签
  stripIgnoreTag: true,   // 剥离未知标签
  stripIgnoreTagBody: ['script', 'style']
};

function clean(input, maxLen = 2000) {
  if (input === null || input === undefined) return '';
  const str = String(input).slice(0, maxLen);
  return xss(str, stripOptions).trim();
}

/** 递归清洗对象中的字符串（用于 req.body） */
function cleanObject(obj, maxLen = 2000) {
  if (Array.isArray(obj)) return obj.map((item) => cleanObject(item, maxLen));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = cleanObject(v, maxLen);
    return out;
  }
  if (typeof obj === 'string') return clean(obj, maxLen);
  return obj;
}

const isEmail = (v) => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(String(v || ''));
const isPhone = (v) => /^(?:\+?86)?1[3-9]\d{9}$/.test(String(v || '').replace(/[\s-]/g, ''));

module.exports = { clean, cleanObject, isEmail, isPhone };
