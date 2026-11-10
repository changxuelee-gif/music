'use strict';

/** 后台登录与身份 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { signToken, adminAuth } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { authLimiter } = require('../../middlewares/rateLimit');

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const username = clean(req.body.username, 50);
  const password = String(req.body.password || '');
  if (!username || !password) return fail(res, '请输入账号和密码', 400);

  const rows = await query(
    'SELECT id, username, password_hash, nickname, avatar, role, status FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  if (!rows.length) return fail(res, '账号或密码错误', 401);

  const user = rows[0];
  if (user.status !== 1) return fail(res, '账号已被禁用，请联系管理员', 403);
  if (!['admin', 'reviewer'].includes(user.role)) return fail(res, '该账号无后台访问权限', 403);
  if (!await bcrypt.compare(password, user.password_hash)) return fail(res, '账号或密码错误', 401);

  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
  const safeUser = { id: user.id, username: user.username, nickname: user.nickname, avatar: user.avatar, role: user.role };
  return ok(res, { token: signToken(safeUser, true), user: safeUser }, '登录成功');
}));

router.get('/me', adminAuth, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT id, username, nickname, avatar, role, last_login_at FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );
  if (!rows.length) return fail(res, '账号不存在', 404);
  return ok(res, rows[0]);
}));

module.exports = router;
