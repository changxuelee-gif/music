'use strict';

/**
 * 前台用户鉴权：注册 / 登录 / 当前用户
 * 游客可浏览，登录后可使用收藏功能
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { ok, fail, asyncHandler } = require('../../utils/response');
const { signToken, userAuth } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { authLimiter } = require('../../middlewares/rateLimit');

const USERNAME_RE = /^[a-zA-Z0-9_]{4,20}$/;

router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const username = clean(req.body.username, 20);
  const password = String(req.body.password || '');
  const nickname = clean(req.body.nickname, 20) || username;

  if (!USERNAME_RE.test(username)) return fail(res, '用户名需为 4-20 位字母、数字或下划线', 400);
  if (password.length < 8 || password.length > 32) return fail(res, '密码长度需为 8-32 位', 400);

  const exists = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  if (exists.length) return fail(res, '用户名已被占用', 409);

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, "user")',
    [username, hash, nickname]
  );

  const user = { id: result.insertId, username, nickname, role: 'user' };
  return ok(res, { token: signToken(user, false), user }, '注册成功');
}));

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const username = clean(req.body.username, 50);
  const password = String(req.body.password || '');
  if (!username || !password) return fail(res, '请输入用户名和密码', 400);

  const rows = await query(
    'SELECT id, username, password_hash, nickname, avatar, role, status FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  if (!rows.length) return fail(res, '用户名或密码错误', 401);

  const row = rows[0];
  if (row.status !== 1) return fail(res, '账号已被禁用', 403);
  if (row.role !== 'user') return fail(res, '请使用后台管理入口登录', 403);
  if (!await bcrypt.compare(password, row.password_hash)) return fail(res, '用户名或密码错误', 401);

  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [row.id]);
  const user = { id: row.id, username: row.username, nickname: row.nickname, avatar: row.avatar, role: row.role };
  return ok(res, { token: signToken(user, false), user }, '登录成功');
}));

router.get('/me', userAuth, asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT id, username, nickname, avatar, role, created_at FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );
  if (!rows.length) return fail(res, '用户不存在', 404);
  return ok(res, rows[0]);
}));

module.exports = router;
