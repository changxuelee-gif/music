'use strict';

/**
 * 站点配置服务：SEO 文案、资质信息、免责声明
 */
const { query } = require('../config/db');
const redis = require('../config/redis');

const CACHE_KEY = 'site:config:v1';

async function getConfigMap() {
  const cached = await redis.get(CACHE_KEY);
  if (cached) return cached;

  const rows = await query('SELECT config_key, config_value FROM site_config');
  const map = {};
  rows.forEach((r) => { map[r.config_key] = r.config_value; });
  await redis.set(CACHE_KEY, map, 600);
  return map;
}

module.exports = { getConfigMap };
