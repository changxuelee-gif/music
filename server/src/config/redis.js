'use strict';

/**
 * Redis 缓存封装
 * 设计原则：缓存是「增强」而非「依赖」——Redis 不可用时接口直接回源 MySQL，不影响可用性。
 */
const Redis = require('ioredis');
const config = require('./index');

let client = null;
let ready = false;

function init() {
  client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: (times) => Math.min(times * 2000, 30000)
  });

  client.on('ready', () => {
    ready = true;
    console.log('[redis] connected');
  });
  client.on('end', () => { ready = false; });
  client.on('error', (err) => {
    // 只记录一次，避免刷屏
    if (ready) console.warn('[redis] error:', err.message);
    ready = false;
  });

  client.connect().catch((err) => console.warn('[redis] connect failed, fallback to mysql:', err.message));
}

async function get(key) {
  if (!ready) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

async function set(key, value, ttlSeconds = 120) {
  if (!ready) return false;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    return true;
  } catch (e) {
    return false;
  }
}

/** 按前缀清理（如后台更新歌单后清空 playlist:list:*） */
async function delByPrefix(prefix) {
  if (!ready) return 0;
  try {
    let cursor = '0';
    let count = 0;
    do {
      const [next, keys] = await client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100);
      cursor = next;
      if (keys.length) {
        await client.del(keys);
        count += keys.length;
      }
    } while (cursor !== '0');
    return count;
  } catch (e) {
    return 0;
  }
}

module.exports = { init, get, set, delByPrefix, isReady: () => ready };
