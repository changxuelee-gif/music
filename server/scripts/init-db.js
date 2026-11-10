'use strict';

/**
 * 数据库初始化脚本
 * 用法：npm run init:db
 * 功能：建库建表 → 灌入演示数据（仅首次）→ 创建初始管理员
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

async function main() {
  const dbName = config.mysql.database;
  console.log(`[init] 连接 MySQL ${config.mysql.host}:${config.mysql.port} ...`);

  const conn = await mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci'
  });

  const schema = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8')
    .replace(/fenghuang_music/g, dbName);
  console.log('[init] 执行建表 SQL ...');
  await conn.query(schema);

  await conn.query(`USE \`${dbName}\``);
  const [rows] = await conn.query('SELECT COUNT(*) AS cnt FROM categories');
  if (rows[0].cnt === 0) {
    console.log('[init] 灌入演示数据 ...');
    const seed = fs.readFileSync(path.join(__dirname, '../src/db/seed.sql'), 'utf8')
      .replace(/fenghuang_music/g, dbName);
    await conn.query(seed);
  } else {
    console.log('[init] 已存在业务数据，跳过演示数据灌入');
  }

  // 初始管理员
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const [adminRows] = await conn.query('SELECT id FROM users WHERE username = ? LIMIT 1', [adminUsername]);
  if (!adminRows.length) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await conn.query(
      'INSERT INTO users (username, password_hash, nickname, role) VALUES (?, ?, ?, "admin")',
      [adminUsername, hash, '超级管理员']
    );
    console.log(`[init] 管理员已创建：${adminUsername} / ${adminPassword}`);
    console.log('       ⚠️ 请登录后立即修改密码，或通过环境变量 ADMIN_PASSWORD 指定');
  } else {
    console.log('[init] 管理员已存在，跳过创建');
  }

  await conn.end();
  console.log('[init] 完成 ✅');
}

main().catch((err) => {
  console.error('[init] 失败:', err.message);
  process.exit(1);
});
