# 宝塔面板部署手册（声屿音乐导航）

> 目标：单台 Linux 服务器（Ubuntu / CentOS / 宝塔面板），Nginx 反代 Node.js，MySQL 8 + Redis 7，Express 托管前端构建产物并做动态 SEO 注入。

---

## 一、宝塔软件商店安装

在宝塔「软件商店」安装：

1. **Nginx**（任意稳定版，建议 1.24+）
2. **MySQL**（8.0；若服务器资源紧张可用 5.7，本项目 SQL 已验证兼容）
3. **Redis**（7.x）
4. **Node 版本管理器**，在其中安装 **Node.js 20 LTS**（勾选 PM2）

安装完成后，在「数据库」新建：

- 数据库名：`shengyu_music`
- 用户名：`shengyu_music`
- 密码：随机强密码
- 访问权限：本地服务器
- 记录端口：默认 3306

Redis 默认无密码可在宝塔 Redis 配置中设置一个强密码，随后填入 `.env`。

---

## 二、上传代码

将整个项目上传到：

```text
/www/wwwroot/shengyu-music
```

目录结构应如下：

```text
/www/wwwroot/shengyu-music/
├── server/
├── web/
├── docker-compose.yml
└── README.md
```

SSH 进入项目目录：

```bash
cd /www/wwwroot/shengyu-music
```

---

## 三、后端环境变量

```bash
cd server
cp .env.example .env
vi .env
```

关键配置：

```env
NODE_ENV=production
PORT=3000
WEB_DIST=../web/dist
CORS_ORIGIN=
SITE_URL=https://music.tengxiangtech.com

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=shengyu_music
MYSQL_PASSWORD=上面宝塔创建的数据库密码
MYSQL_DATABASE=shengyu_music

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=宝塔 Redis 密码，未留空

JWT_SECRET=用 openssl rand -hex 32 生成
JWT_EXPIRES=2h
JWT_USER_EXPIRES=7d

# 未配置 OSS 时会自动上传到 server/uploads
OSS_REGION=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
OSS_PUBLIC_HOST=

ALLOWED_MUSIC_DOMAINS=y.qq.com,qqmusic.qq.com,music.163.com,kugou.com,kuwo.cn,qishui.douyin.com,music.douyin.com,migu.cn

ADMIN_USERNAME=admin
ADMIN_PASSWORD=至少12位强密码
```

生成 JWT：

```bash
openssl rand -hex 32
```

---

## 四、初始化数据库

```bash
cd /www/wwwroot/shengyu-music/server
npm install --omit=dev
npm run init:db
```

看到 `[init] 完成 ✅` 即表示表、种子数据、初始管理员创建成功。

> 生产环境如果不想保留演示歌单，可先清空 `server/src/db/seed.sql` 再执行 init；但首次仍建议保留，方便验证后台链路。

---

## 五、前端生产构建

```bash
cd /www/wwwroot/shengyu-music/web
cp .env.example .env.production
vi .env.production
```

填写：

```env
VITE_USE_MOCK=false
VITE_API_BASE=/api
VITE_SITE_URL=https://music.tengxiangtech.com
# Google Search Console / Bing Webmaster 上线验证后回填
VITE_GOOGLE_VERIFICATION=
VITE_BING_VERIFICATION=
```

构建：

```bash
npm install
npm run build
```

产物在 `web/dist`，由后端 `NODE_ENV=production` 时自动托管。

---

## 六、PM2 启动 Node 服务

```bash
cd /www/wwwroot/shengyu-music/server
pm2 start src/server.js --name shengyu-music
pm2 save
pm2 startup
```

验证：

```bash
curl http://127.0.0.1:3000/api/health
```

应返回 `{"code":0,...}`。

---

## 七、宝塔新建网站与 Nginx 反代

1. 宝塔「网站」→「添加站点」：域名填 `music.tengxiangtech.com`，PHP 版本选「纯静态」。
2. 进入站点设置 →「反向代理」→ 添加反向代理：
   - 代理名称：`shengyu-node`
   - 目标 URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`
3. 站点设置 →「SSL」→ Let's Encrypt 申请证书，开启「强制 HTTPS」。
4. 确认 Nginx 防火墙放行 80/443。

如需手动调整，推荐站点配置片段：

```nginx
server {
    listen 443 ssl http2;
    server_name music.tengxiangtech.com;

    ssl_certificate    /path/fullchain.pem;
    ssl_certificate_key /path/privkey.pem;

    # Express 已托管 dist、API、动态 SEO，统一反代即可
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源强缓存（由 Express 返回 /assets 与 /images）
    location ~* \.(js|css|svg|png|jpg|jpeg|webp|gif|ico)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

---

## 八、Google / Bing 收录上线清单

1. 确保 `SITE_URL` 为正式 HTTPS 域名，重新构建并重启 Node。
2. 浏览器访问：
   - `https://music.tengxiangtech.com/robots.txt`
   - `https://music.tengxiangtech.com/sitemap.xml`
3. Google Search Console：
   - 添加资源 `https://music.tengxiangtech.com`
   - 完成 HTML 标签验证，把验证码填入 `web/.env.production` 的 `VITE_GOOGLE_VERIFICATION`，重新 `npm run build`
   - 提交站点地图 `/sitemap.xml`
   - 对首页、5～10 个核心歌单页做「请求编入索引」
4. Bing Webmaster Tools：
   - 导入 Search Console 或手动验证
   - 填入 `VITE_BING_VERIFICATION`（即 `msvalidate.01`）
   - 提交 `/sitemap.xml`
5. 保持每篇歌单 URL 固定、slug 不改；下架歌单不要 404 随机变化。
6. 后台持续人工录入新歌单后，首页/列表缓存会自动清理；如需强制刷新，重启 PM2 或清空 Redis。

---

## 九、日常更新与备份

更新代码：

```bash
cd /www/wwwroot/shengyu-music
# 上传新代码
cd server && npm install --omit=dev && pm2 reload shengyu-music
cd ../web && npm install && npm run build && pm2 reload shengyu-music
```

宝塔计划任务建议：

- 每天凌晨备份 MySQL 数据库；
- 每周备份 `server/uploads/`；
- Redis 可开启 AOF/RDB 持久化。

---

## 十、合规检查

- 页脚始终展示：凤凰爱听（北京）信息技术有限公司、京网文〔2023〕3019-099号、京B2-20213133。
- 后台录入任何歌曲链接时，`ALLOWED_MUSIC_DOMAINS` 之外一律保存失败。
- 全站无音频文件、无播放器、无爬虫任务。
