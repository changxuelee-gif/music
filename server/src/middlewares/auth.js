'use strict';

/**
 * JWT 鉴权
 * - 后台角色：admin（管理员）/ reviewer（审核员）
 * - 前台角色：user（普通用户）
 * - 同一套签名密钥，通过 role 做权限隔离
 */
const jwt = require('jsonwebtoken');
const config = require('../config');
const { fail } = require('../utils/response');

const ADMIN_ROLES = ['admin', 'reviewer'];

function signToken(user, isAdmin = false) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, nickname: user.nickname || user.username },
    config.jwt.secret,
    { expiresIn: isAdmin ? config.jwt.expires : config.jwt.userExpires }
  );
}

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * @param {string[]} roles 允许的角色，留空表示任意已登录角色
 */
function authRequired(roles = []) {
  return (req, res, next) => {
    const token = getToken(req);
    if (!token) return fail(res, '未登录或登录已过期', 401);

    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = payload;

      if (roles.length && !roles.includes(payload.role)) {
        return fail(res, '无权限访问该资源', 403);
      }
      return next();
    } catch (err) {
      return fail(res, '登录状态无效，请重新登录', 401);
    }
  };
}

/** 后台接口统一鉴权 */
const adminAuth = authRequired(ADMIN_ROLES);
/** 仅管理员（审核员不可操作站点配置、账号管理） */
const adminOnly = authRequired(['admin']);
/** 前台登录用户 */
const userAuth = authRequired(['user']);

module.exports = { signToken, authRequired, adminAuth, adminOnly, userAuth, ADMIN_ROLES };
