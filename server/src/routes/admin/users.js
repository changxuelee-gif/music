'use strict';

/** 后台账号管理（仅超级管理员） */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { ok, fail, paged, asyncHandler } = require('../../utils/response');
const { adminOnly } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { parsePagination } = require('../../utils/helpers');

router.use(adminOnly);

router.get('/users', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query, 20, 60);
  const where = ["role IN ('admin','reviewer')"];
  const params = [];
  if (req.query.keyword) {
    where.push('username LIKE ?');
    params.push(`%${String(req.query.keyword).slice(0, 30)}%`);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const totalRows = await query(`SELECT COUNT(*) AS total FROM users ${whereSql}`, params);
  const rows = await query(
    `SELECT id, username, nickname, role, status, last_login_at, created_at
     FROM users ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return paged(res, { list: rows, total: totalRows[0]?.total || 0, page, pageSize });
}));

router.post('/users', asyncHandler(async (req, res) => {
  const username = clean(req.body.username, 20);
  const password = String(req.body.password || '');
  const role = req.body.role === 'admin' ? 'admin' : 'reviewer';
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) return fail(res, '账号需为 4-20 位字母、数字或下划线', 400);
  if (password.length < 8) return fail(res, '密码至少 8 位', 400);

  const exists = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
  if (exists.length) return fail(res, '账号已存在', 409);

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, ?)',
    [username, hash, clean(req.body.nickname, 20) || username, role]
  );
  return ok(res, { id: result.insertId }, '账号已创建');
}));

router.put('/users/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id === req.user.id && req.body.status === 0) return fail(res, '不能禁用当前登录账号', 400);

  const fields = [];
  const params = [];
  if (['admin', 'reviewer'].includes(req.body.role)) {
    fields.push('role = ?');
    params.push(req.body.role);
  }
  if ([0, 1].includes(req.body.status)) {
    fields.push('status = ?');
    params.push(req.body.status);
  }
  if (req.body.nickname !== undefined) {
    fields.push('nickname = ?');
    params.push(clean(req.body.nickname, 20));
  }
  if (req.body.password) {
    if (String(req.body.password).length < 8) return fail(res, '密码至少 8 位', 400);
    fields.push('password_hash = ?');
    params.push(await bcrypt.hash(String(req.body.password), 10));
  }
  if (!fields.length) return fail(res, '没有需要更新的字段', 400);

  await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
  return ok(res, { id }, '账号已更新');
}));

module.exports = router;
