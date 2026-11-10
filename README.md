<div align="center">

# 声屿音乐导航 · SoundIsle Music Navigator

### 发现好音乐，直达正版平台

[官网在线体验](https://music.tengxiangtech.com) · [问题反馈](https://music.tengxiangtech.com/complaint)

</div>

---

## 🎵 项目简介

**声屿音乐导航**是一个精品人工策展的音乐导航站。我们不存储、不播放任何音频，只做正版音乐平台的"发现层"——按风格、场景、音乐人组织歌单，点击即跳转 QQ音乐、网易云、酷狗、酷我等正版平台官方页面。

> 我们只做发现，不做播放。

## ✨ 核心特性

- 🎼 **人工策展**：编辑人工试听、逐条录入，不做机器抓取、不自动同步榜单
- 🚫 **零音频零播放**：站内没有任何音频文件、歌词、播放器，所有动效只是视觉装饰
- ✅ **正版直达**：外链白名单校验，只跳转 QQ音乐、网易云、酷狗、酷我、汽水音乐等官方域名
- 📱 **沉浸式设计**：深色科技风 + 磨砂玻璃质感，桌面/移动端自适应
- 🔍 **SEO 友好**：canonical、JSON-LD、sitemap、OG/Twitter Card 全套配齐，支持百度主动推送
- 🤖 **开放 API**：提供带鉴权的开放接口，支持批量提交歌单/歌曲/音乐人
- 📊 **数据看板**：内置 PV/UV 统计、热门排序、投诉反馈系统
- 🏷️ **多维度分类**：按风格（国风/流行/电子/民谣/摇滚/爵士/古典/嘻哈）+ 场景（通勤/深夜/专注/运动/咖啡馆/影视混剪）双维度组织

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Tailwind CSS + Pinia |
| 后端 | Node.js + Express + MySQL 8 + Redis |
| 部署 | Nginx 反向代理 + PM2 进程管理 + 宝塔面板 |
| SEO | 服务端 meta 注入 + JSON-LD + sitemap.xml + 百度主动推送 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://gitee.com/yrCode/music.git
cd music

# 启动后端
cd server
npm install
cp .env.example .env  # 编辑数据库配置
npm run init-db       # 初始化数据库
npm run dev           # 启动后端 :3003

# 启动前端
cd ../web
npm install
npm run dev           # 启动前端 :5173
```

## 📁 项目结构

```
music/
├── web/                    # Vue3 前端
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── views/          # 页面
│   │   ├── stores/         # Pinia 状态
│   │   └── types/          # TypeScript 类型
│   └── public/images/      # 静态资源
├── server/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middlewares/    # 中间件
│   │   ├── config/         # 配置
│   │   └── utils/          # 工具函数
│   └── scripts/            # 运维脚本
└── DEPLOY-BAOTA.md         # 宝塔部署手册
```

## 🔌 开放 API

所有接口需在 Header 携带 `X-API-Key`：

```bash
# 健康检查
curl https://music.tengxiangtech.com/api/open/ping \
  -H "X-API-Key: your-key"

# 提交歌曲
curl -X POST https://music.tengxiangtech.com/api/open/songs \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '[{"playlistSlug":"guofeng-shanhe","title":"歌名","artistName":"歌手","url":"https://y.qq.com/n/ryqq/search?w=歌名"}]'
```

## 📊 数据合规

- 不存储任何音频、歌词、音源文件
- 不抓取第三方平台数据
- 所有外链均为正版平台搜索页
- 版权投诉入口：copyright@fenghuangaiting.com

## 📄 License

本项目仅用于学习交流，歌单/歌曲数据版权归原平台及权利人所有。

---

<div align="center">

© 凤凰爱听（北京）信息技术有限公司 · 京B2-20213133 · 京网文〔2023〕3019-099号

</div>
