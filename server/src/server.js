'use strict';

/** 服务入口：先探测 MySQL / 初始化 Redis，再监听端口 */
const app = require('./app');
const config = require('./config');
const { pool } = require('./config/db');
const redis = require('./config/redis');
const fs = require('fs');

async function bootstrap() {
  // 本地兜底上传目录
  fs.mkdirSync(config.upload.localDir, { recursive: true });

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('[mysql] connected');
  } catch (err) {
    console.error('[mysql] 连接失败，请检查 .env 配置与数据库状态:', err.message);
    process.exit(1);
  }

  redis.init(); // 失败会自动降级，不阻塞启动

  const server = app.listen(config.port, () => {
    console.log(`\n🎵 声屿音乐导航服务已启动: http://localhost:${config.port}`);
    console.log(`   环境: ${config.env} | 外链白名单: ${config.allowedMusicDomains.join(', ')}\n`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[server] 收到 ${signal}，正在优雅退出...`);
    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();
