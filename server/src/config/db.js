'use strict';

/**
 * MySQL 连接池（mysql2/promise）
 * - 对外暴露 query / getConnection
 * - 统一 here 打印慢查询，便于生产排障
 */
const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: config.mysql.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: '+08:00',
  dateStrings: true,
  multipleStatements: false
});

async function query(sql, params = []) {
  const started = Date.now();
  try {
    const [rows] = await pool.query(sql, params);
    const cost = Date.now() - started;
    if (cost > 300) console.warn(`[mysql] slow query ${cost}ms: ${sql.slice(0, 120)}`);
    return rows;
  } catch (err) {
    console.error('[mysql] query failed:', err.message, '\nSQL:', sql);
    throw err;
  }
}

/** 事务封装：业务异常自动回滚 */
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, query, transaction };
