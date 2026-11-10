'use strict';

/**
 * 内容类缓存统一失效
 * 后台任何写操作后调用，保证首页/列表/详情不会读到旧数据
 */
const redis = require('../config/redis');

async function bustContentCaches() {
  await Promise.all([
    redis.delByPrefix('home:'),
    redis.delByPrefix('playlist:list:'),
    redis.delByPrefix('playlist:detail:'),
    redis.delByPrefix('artist:'),
    redis.delByPrefix('site:')
  ]);
}

module.exports = { bustContentCaches };
