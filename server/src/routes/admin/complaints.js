'use strict';

/**
 * 后台版权投诉工单管理
 */
const express = require('express');
const router = express.Router();
const { query } = require('../../config/db');
const { ok, fail, paged, asyncHandler } = require('../../utils/response');
const { adminAuth } = require('../../middlewares/auth');
const { clean } = require('../../utils/xss');
const { parsePagination } = require('../../utils/helpers');

router.use(adminAuth);

router.get('/complaints', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query, 12, 60);
  const where = ['1 = 1'];
  const params = [];
  if (['pending', 'processing', 'done', 'rejected'].includes(req.query.status)) {
    where.push('c.status = ?');
    params.push(req.query.status);
  }
  if (req.query.keyword) {
    where.push('(c.ticket_no LIKE ? OR c.name LIKE ? OR c.target_url LIKE ?)');
    const like = `%${String(req.query.keyword).slice(0, 40)}%`;
    params.push(like, like, like);
  }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const totalRows = await query(`SELECT COUNT(*) AS total FROM complaints c ${whereSql}`, params);
  const rows = await query(
    `SELECT c.*, u.nickname AS handler_name FROM complaints c
     LEFT JOIN users u ON u.id = c.handler_id
     ${whereSql} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return paged(res, {
    list: rows.map((r) => ({
      id: r.id, ticketNo: r.ticket_no, name: r.name, contact: r.contact, type: r.type,
      targetUrl: r.target_url, description: r.description, evidenceUrl: r.evidence_url,
      status: r.status, reply: r.reply, handlerName: r.handler_name,
      createdAt: r.created_at, handledAt: r.handled_at
    })),
    total: totalRows[0]?.total || 0,
    page,
    pageSize
  });
}));

router.get('/complaints/:id', asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM complaints WHERE id = ? LIMIT 1', [parseInt(req.params.id, 10)]);
  if (!rows.length) return fail(res, '工单不存在', 404);
  return ok(res, rows[0]);
}));

/** 处理工单：变更状态 + 回复 */
router.patch('/complaints/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const status = ['pending', 'processing', 'done', 'rejected'].includes(req.body.status) ? req.body.status : 'processing';
  const reply = clean(req.body.reply, 2000);

  await query(
    `UPDATE complaints SET status = ?, reply = ?, handler_id = ?,
       handled_at = IF(? IN ('done','rejected'), NOW(), handled_at) WHERE id = ?`,
    [status, reply, req.user.id, status, id]
  );
  return ok(res, { id, status }, '工单已更新');
}));

module.exports = router;
