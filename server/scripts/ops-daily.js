'use strict';

/**
 * 每日自动运营脚本（由系统 crontab 调用）
 * 合规边界：不抓取任何第三方数据，只基于已有数据做自动运营决策。
 * 动作：
 *   1. 按点击量自动调整热门标记（is_hot）
 *   2. 14 天前的"新收录"自动过期（is_new=0）
 *   3. 清理 Redis 缓存让首页刷新
 *   4. 检查外链白名单是否有漏网
 *   5. 输出运营日报
 */
require('dotenv').config();
const { query, pool } = require('../src/config/db');
const redis = require('../src/config/redis');
const config = require('../src/config');

const log = (...a) => console.log(`[ops-daily ${new Date().toISOString()}]`, ...a);

async function autoHotByClicks() {
  // 点击量前 15 名设为热门，其余取消热门
  const rows = await query(
    `SELECT id FROM playlists WHERE status=1 ORDER BY click_count DESC LIMIT 15`
  );
  const ids = rows.map(r => r.id);
  await query('UPDATE playlists SET is_hot=0 WHERE status=1');
  if (ids.length) {
    await query(`UPDATE playlists SET is_hot=1 WHERE id IN (${ids.map(()=>'?').join(',')})`, ids);
  }
  log(`热门歌单已按点击量更新，共 ${ids.length} 个`);
}

async function expireNew() {
  // 14 天前发布的歌单取消"新收录"标记
  const [res] = await query(
    `UPDATE playlists SET is_new=0 WHERE is_new=1 AND created_at < DATE_SUB(NOW(), INTERVAL 14 DAY)`
  );
  log(`新收录自动过期：${res.affectedRows} 个歌单`);
}

async function bustCache() {
  if (redis.client) {
    const keys = await redis.client.keys('home:*');
    if (keys.length) await redis.client.del(...keys);
    log(`已清理 ${keys.length} 个首页缓存键`);
  }
}

async function auditUrls() {
  const bad = await query(
    `SELECT id, url FROM songs WHERE status=1 AND url NOT LIKE 'https://y.qq.com/%'
     AND url NOT LIKE 'https://music.163.com/%' AND url NOT LIKE 'https://www.kugou.com/%'
     AND url NOT LIKE 'https://www.kuwo.cn/%' AND url NOT LIKE 'https://www.qishui.douyin.com/%'
     AND url NOT LIKE 'https://music.douyin.com/%' AND url NOT LIKE 'https://www.migu.cn/%'
     LIMIT 50`
  );
  if (bad.length) log(`⚠️ 发现 ${bad.length} 首歌外链不在白名单，建议检查：`, bad.slice(0,10).map(r=>r.id));
  else log('外链白名单检查通过');
}

async function dailyReport() {
  const [[pl]] = await query('SELECT COUNT(*) c FROM playlists WHERE status=1');
  const [[sg]] = await query('SELECT COUNT(*) c FROM songs WHERE status=1');
  const [[ar]] = await query('SELECT COUNT(*) c FROM artists WHERE status=1');
  const [[pending]] = await query(`SELECT COUNT(*) c FROM complaints WHERE status='pending'`);
  const top = await query(
    `SELECT title, click_count, favorite_count FROM playlists WHERE status=1 ORDER BY click_count DESC LIMIT 5`
  );
  log('=== 运营日报 ===');
  log(`歌单 ${pl.c} | 歌曲 ${sg.c} | 音乐人 ${ar.c} | 待处理投诉 ${pending.c}`);
  log('Top5 热门歌单：');
  top.forEach((t,i) => log(`  ${i+1}. ${t.title} (点击 ${t.click_count} / 收藏 ${t.favorite_count})`));
}

async function main() {
  log('开始每日运营任务...');
  try {
    await autoHotByClicks();
    await expireNew();
    await bustCache();
    await auditUrls();
    await dailyReport();
    log('每日运营任务完成 ✅');
  } catch (e) {
    console.error('[ops-daily] 任务失败:', e.message);
  } finally {
    await pool.end().catch(()=>{});
    process.exit(0);
  }
}

main();
