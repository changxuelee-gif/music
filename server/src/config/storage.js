'use strict';

/**
 * 对象存储：优先阿里云 OSS；未配置 AK/SK 时自动降级到本地 uploads 目录（便于本地开发）
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('./index');

let ossClient = null;
const ossEnabled = Boolean(config.oss.accessKeyId && config.oss.accessKeySecret && config.oss.bucket);

if (ossEnabled) {
  try {
    const OSS = require('ali-oss');
    ossClient = new OSS({
      region: config.oss.region || undefined,
      accessKeyId: config.oss.accessKeyId,
      accessKeySecret: config.oss.accessKeySecret,
      bucket: config.oss.bucket,
      secure: true
    });
    console.log('[storage] aliyun oss enabled');
  } catch (err) {
    console.warn('[storage] oss init failed, fallback local:', err.message);
    ossClient = null;
  }
}

function buildObjectName(originalName) {
  const ext = (path.extname(originalName) || '.jpg').toLowerCase().replace(/[^a-z0-9.]/g, '');
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(8).toString('hex');
  return `music-nav/${day}/${rand}${ext}`;
}

/**
 * 上传 Buffer
 * @returns {Promise<{url:string, provider:'oss'|'local', objectName:string}>}
 */
async function uploadBuffer(buffer, originalName, mimeType) {
  const objectName = buildObjectName(originalName);

  if (ossClient) {
    const result = await ossClient.put(objectName, buffer, { mime: mimeType });
    let url = result.url;
    if (config.oss.publicHost) {
      url = `${config.oss.publicHost.replace(/\/$/, '')}/${objectName}`;
    }
    return { url, provider: 'oss', objectName };
  }

  // 本地兜底
  const dir = path.join(config.upload.localDir, path.dirname(objectName));
  fs.mkdirSync(dir, { recursive: true });
  const abs = path.join(config.upload.localDir, objectName);
  fs.writeFileSync(abs, buffer);
  return { url: `/uploads/${objectName}`, provider: 'local', objectName };
}

module.exports = { uploadBuffer, ossEnabled };
