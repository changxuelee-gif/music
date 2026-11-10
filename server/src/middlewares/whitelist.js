'use strict';

/**
 * 外链白名单校验（合规红线 3）
 * 所有歌曲跳转链接、音乐人官方主页链接，必须属于已配置的正版音乐平台域名。
 * 拒绝：非 http(s) 协议、短链、中转页、未知域名。
 */
const config = require('../config');
const { fail } = require('../utils/response');

const ALLOWED = config.allowedMusicDomains.map((d) => d.toLowerCase());

function isAllowedUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch (e) {
    return false;
  }
  if (!['http:', 'https:'].includes(url.protocol)) return false;

  const host = url.hostname.toLowerCase();
  // 精确匹配或子域名匹配（www.kugou.com 命 kugou.com；fakekugou.com 不命中）
  return ALLOWED.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** 校验单个字段，不合法直接抛给全局错误处理 */
function assertAllowedUrl(url, fieldLabel = '跳转链接') {
  if (!isAllowedUrl(url)) {
    const err = new Error(`${fieldLabel}不合法：仅允许配置正版音乐平台域名（${ALLOWED.join('、')}）`);
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return true;
}

/** 中间件：校验 body 中指定字段 */
function whitelistBody(fields = ['url']) {
  return (req, res, next) => {
    for (const field of fields) {
      const value = req.body?.[field];
      if (value && !isAllowedUrl(value)) {
        return fail(res, `链接不合规：仅允许 ${ALLOWED.join(' / ')} 等正版音乐平台域名`, 400);
      }
    }
    next();
  };
}

module.exports = { isAllowedUrl, assertAllowedUrl, whitelistBody, ALLOWED_DOMAINS: ALLOWED };
