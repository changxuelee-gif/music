/**
 * 本地演示数据（VITE_USE_MOCK=true 时启用）
 * 用于无后端 / 无数据库环境下完整预览前端与后台；
 * 所有歌曲链接均指向正版音乐平台官方页面，站点本身不提供任何音频。
 */
import type {
  Artist, Banner, Category, HomeData, Playlist, SiteConfig, Song, Tag
} from '@/types'

import { PLATFORM_LABELS } from '@/utils/platform'

export const mockConfig: SiteConfig = {
  siteName: '声屿音乐导航',
  slogan: '发现好音乐，直达正版音乐平台',
  keywords: '音乐导航,歌单推荐,正版音乐,音乐发现,声屿',
  description:
    '声屿是精品人工音乐导航发现站，按风格、场景、音乐人组织歌单，帮助音乐爱好者与短视频创作者发现好音乐，并直达正版音乐平台。本站不存储、不播放任何音频。',
  companyName: '凤凰爱听（北京）信息技术有限公司',
  icpNo: '京B2-20213133',
  wenwangwenNo: '京网文〔2023〕3019-099号',
  complaintEmail: 'copyright.com',
  complaintPhone: '010-8888 6666',
  analyticsCode: '',
  disclaimer:
    '本站为音乐导航网站，仅提供正版音乐平台官方页面的跳转服务，不存储、不播放、不提供任何音频、歌词或音源文件。本站歌单、歌曲与音乐人信息均由编辑人工整理录入，版权归原权利人所有。如权利人认为本站收录信息侵犯其合法权益，可通过版权投诉入口提交权属材料，我们将在收到有效通知后依法处理。',
  privacyPolicy:
    '我们仅收集维持网站运行所必需的最小信息：访问日志（IP、浏览器标识、访问路径）用于安全与统计分析；投诉表单中的姓名、联系方式与权属材料仅用于处理版权投诉。我们不会向第三方出售或出租个人信息。您可通过版权投诉邮箱联系我们，行使查询、更正与删除权利。',
  hotSearchWords: ['国风', '深夜', '纯音乐', '民谣', '通勤', '周深'],
  platforms: Object.entries(PLATFORM_LABELS).map(([key, label]) => ({ key, label })),
  allowedDomains: ['y.qq.com', 'qqmusic.qq.com', 'music.163.com', 'kugou.com', 'kuwo.cn', 'qishui.douyin.com', 'music.douyin.com', 'migu.cn']
}

export const mockTags: Tag[] = [
  { id: 1, name: '空灵', slug: 'kongling', color: '#9B8CFF' },
  { id: 2, name: '治愈', slug: 'zhiyu', color: '#8FD3C7' },
  { id: 3, name: '大气', slug: 'daqi', color: '#E8C56B' },
  { id: 4, name: '复古', slug: 'fugu', color: '#C98F6B' },
  { id: 5, name: '燃', slug: 'ran', color: '#E06C5A' },
  { id: 6, name: '温柔', slug: 'wenrou', color: '#F0A6C0' },
  { id: 7, name: '电影感', slug: 'dianyinggan', color: '#6B7CFF' },
  { id: 8, name: '轻电子', slug: 'qingdianzi', color: '#5B6CFF' },
  { id: 9, name: '钢琴', slug: 'gangqin', color: '#9FB3C8' },
  { id: 10, name: '女声', slug: 'nvsheng', color: '#C77DA8' },
  { id: 11, name: '男声', slug: 'nansheng', color: '#7C8CA8' },
  { id: 12, name: '纯音乐', slug: 'chunyinyue', color: '#8FA88B' },
  { id: 13, name: '国风器乐', slug: 'guofengqiyue', color: '#E8C56B' },
  { id: 14, name: '氛围', slug: 'fenwei', color: '#7C5CFF' },
  { id: 15, name: '城市', slug: 'chengshi', color: '#5B6CFF' }
]

export const mockCategories: Category[] = [
  { id: 1, name: '国风', slug: 'guofeng', type: 'style', icon: '🏮', color: '#E8C56B', intro: '五声音阶里的东方叙事，山河入梦', playlistCount: 1 },
  { id: 2, name: '流行', slug: 'pop', type: 'style', icon: '🎧', color: '#7C5CFF', intro: '当代华语与全球流行的高光切片', playlistCount: 1 },
  { id: 3, name: '电子', slug: 'electronic', type: 'style', icon: '🌌', color: '#5B6CFF', intro: '合成器、氛围与城市夜色的电流', playlistCount: 2 },
  { id: 4, name: '民谣', slug: 'folk', type: 'style', icon: '🌾', color: '#8FA88B', intro: '木吉他与远方，写给生活的注脚', playlistCount: 1 },
  { id: 5, name: '摇滚', slug: 'rock', type: 'style', icon: '🔥', color: '#C2543F', intro: '失真吉他里的诚实与热血', playlistCount: 0 },
  { id: 6, name: '爵士', slug: 'jazz', type: 'style', icon: '🎷', color: '#C9A227', intro: '即兴、铜管与午后的一杯手冲', playlistCount: 1 },
  { id: 7, name: '古典', slug: 'classical', type: 'style', icon: '🎻', color: '#9FB3C8', intro: '弦乐与钢琴，时间沉淀的声音', playlistCount: 2 },
  { id: 8, name: '嘻哈', slug: 'hiphop', type: 'style', icon: '🎤', color: '#6B7CFF', intro: '节奏、押韵与街头的表达欲', playlistCount: 0 },

  { id: 11, name: '通勤路上', slug: 'commute', type: 'scene', icon: '🚇', color: '#5B6CFF', intro: '地铁与耳机之间的私人时区', playlistCount: 2 },
  { id: 12, name: '深夜独处', slug: 'late-night', type: 'scene', icon: '🌙', color: '#7C5CFF', intro: '城市安静下来之后的声音', playlistCount: 2 },
  { id: 13, name: '专注工作', slug: 'focus', type: 'scene', icon: '🧠', color: '#4FA3A5', intro: '不打扰的背景声，进入心流', playlistCount: 1 },
  { id: 14, name: '运动燃点', slug: 'workout', type: 'scene', icon: '⚡', color: '#D97757', intro: '让心率与节拍一起上升', playlistCount: 1 },
  { id: 15, name: '咖啡馆', slug: 'cafe', type: 'scene', icon: '☕', color: '#C9A227', intro: '午后、窗边与低频爵士', playlistCount: 1 },
  { id: 16, name: '影视混剪', slug: 'video-edit', type: 'scene', icon: '🎬', color: '#9B6BFF', intro: '给短视频创作者的配乐灵感', playlistCount: 1 },

  { id: 21, name: '华语', slug: 'chinese', type: 'language', icon: '🇨🇳', color: '#E8C56B', intro: '华语流行与独立音乐', playlistCount: 4 },
  { id: 22, name: '欧美', slug: 'western', type: 'language', icon: '🌍', color: '#5B6CFF', intro: '欧美流行、摇滚与电子', playlistCount: 2 },
  { id: 23, name: '日韩', slug: 'jk', type: 'language', icon: '🌸', color: '#C77DA8', intro: '日系与韩系的声音审美', playlistCount: 0 },
  { id: 24, name: '纯音乐', slug: 'instrumental', type: 'language', icon: '🎹', color: '#9FB3C8', intro: '没有人声，只有氛围', playlistCount: 2 }
]

const cat = (id: number) => {
  const c = mockCategories.find((x) => x.id === id)
  return c ? { id: c.id, name: c.name, slug: c.slug } : null
}

const tagList = (ids: number[]) => ids.map((id) => mockTags.find((t) => t.id === id)!).filter(Boolean)

let songId = 1

// 正版平台官方搜索页（演示数据用搜索直达，生产可由编辑替换为歌曲详情页直链）
const qq = (q: string) => `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(q)}`
const ne = (q: string) => `https://music.163.com/#/search/m/?s=${encodeURIComponent(q)}`

const s = (title: string, artistName: string, platform: Song['platform'], url: string, duration: string): Song => ({
  id: songId++,
  title,
  artistName,
  platform,
  platformLabel: PLATFORM_LABELS[platform],
  url,
  duration
})

const songs = {
  guofeng: [
    s('大鱼', '周深', 'qq', qq('大鱼'), '05:08'),
    s('左手指月', '萨顶顶', 'qq', qq('左手指月'), '04:34'),
    s('琵琶语', '林海', 'netease', ne('琵琶语'), '04:12'),
    s('赤伶', 'HITA', 'netease', ne('赤伶'), '04:24'),
    s('兰亭序', '周杰伦', 'qq', qq('兰亭序'), '04:19')
  ],
  city: [
    s('夜空中最亮的星', '逃跑计划', 'qq', qq('夜空中最亮的星'), '04:12'),
    s('Intro', 'The xx', 'netease', ne('Intro'), '02:08'),
    s('光年之外', '邓紫棋', 'qq', qq('光年之外'), '03:55'),
    s('City of Stars', 'Ryan Gosling', 'netease', ne('City of Stars'), '03:59')
  ],
  focus: [
    s('Merry Christmas Mr. Lawrence', '坂本龙一', 'netease', ne('Merry Christmas Mr. Lawrence'), '04:38'),
    s('River Flows in You', 'Yiruma', 'qq', qq('River Flows in You'), '03:08'),
    s('Nuvole Bianche', 'Ludovico Einaudi', 'netease', ne('Nuvole Bianche'), '05:57'),
    s('月光', '贝多芬', 'netease', ne('月光'), '05:20')
  ],
  folk: [
    s('理想三旬', '陈鸿宇', 'qq', qq('理想三旬'), '04:20'),
    s('云烟成雨', '房东的猫', 'netease', ne('云烟成雨'), '04:03'),
    s('走马', '陈粒', 'netease', ne('走马'), '03:57'),
    s('南方姑娘', '赵雷', 'qq', qq('南方姑娘'), '04:31')
  ],
  workout: [
    s('Wake Me Up', 'Avicii', 'netease', ne('Wake Me Up'), '04:07'),
    s('Blinding Lights', 'The Weeknd', 'qq', qq('Blinding Lights'), '03:20'),
    s('Animals', 'Martin Garrix', 'netease', ne('Animals'), '05:03'),
    s('Counting Stars', 'OneRepublic', 'qq', qq('Counting Stars'), '04:17')
  ],
  cafe: [
    s('Fly Me to the Moon', 'Frank Sinatra', 'netease', ne('Fly Me to the Moon'), '02:27'),
    s('Autumn Leaves', 'Bill Evans', 'netease', ne('Autumn Leaves'), '06:30'),
    s('The Girl from Ipanema', 'Stan Getz', 'qq', qq('The Girl from Ipanema'), '05:21')
  ],
  pop: [
    s('玫瑰', '贰佰', 'netease', ne('玫瑰'), '04:54'),
    s('小幸运', '田馥甄', 'qq', qq('小幸运'), '04:25'),
    s('倔强', '五月天', 'qq', qq('倔强'), '04:20'),
    s('出现又离开', '梁博', 'qq', qq('出现又离开'), '04:53')
  ],
  cinema: [
    s('Experience', 'Ludovico Einaudi', 'netease', ne('Experience'), '05:15'),
    s('The Truth', 'Hans Zimmer', 'netease', ne('The Truth'), '04:13'),
    s('一生所爱', '卢冠廷', 'qq', qq('一生所爱'), '04:43'),
    s('卡农', '帕赫贝尔', 'netease', ne('卡农'), '04:37')
  ]
}

type BasePlaylist = Omit<Playlist, 'songs' | 'related'>

const base: BasePlaylist[] = [
  {
    id: 1, title: '山河入梦 · 国风精选', slug: 'guofeng-shanhe', cover: '/images/covers/cover-1.svg',
    summary: '五声音阶里的东方叙事，适合深夜与雨天。',
    description: '从器乐到人声，收录近三年在国风场景中被反复提及的作品。所有条目仅提供正版平台跳转，网站本身不存储、不播放任何音频。',
    curator: '声屿编辑部', songCount: 5, viewCount: 12840, clickCount: 3260, favoriteCount: 412,
    isFeatured: true, isHot: true, isNew: false, category: cat(1), scene: cat(12), language: cat(21),
    tags: tagList([1, 3, 13, 14]), publishedAt: '2026-10-28'
  },
  {
    id: 2, title: '城市电波 · 深夜通勤', slug: 'midnight-city', cover: '/images/covers/cover-2.svg',
    summary: '地铁、耳机与城市夜色之间的私人时区。',
    description: '轻电子与氛围音乐组成的通勤陪伴清单，节拍不吵，情绪刚好。',
    curator: '声屿编辑部', songCount: 4, viewCount: 9630, clickCount: 2180, favoriteCount: 305,
    isFeatured: true, isHot: true, isNew: true, category: cat(3), scene: cat(11), language: cat(21),
    tags: tagList([8, 15, 7, 14]), publishedAt: '2026-11-02'
  },
  {
    id: 3, title: '心流时刻 · 钢琴与纯音乐', slug: 'focus-flow', cover: '/images/covers/cover-3.svg',
    summary: '不打扰的背景声，帮助你进入专注状态。',
    description: '以钢琴、弦乐与极简氛围为主的工作陪伴清单，适合写作、编码与阅读。',
    curator: '声屿编辑部', songCount: 4, viewCount: 7920, clickCount: 1740, favoriteCount: 268,
    isFeatured: true, isHot: true, isNew: true, category: cat(7), scene: cat(13), language: cat(24),
    tags: tagList([9, 12, 2]), publishedAt: '2026-11-03'
  },
  {
    id: 4, title: '民谣里的远方', slug: 'folk-faraway', cover: '/images/covers/cover-4.svg',
    summary: '木吉他与远方，写给生活的注脚。',
    description: '从校园民谣到独立创作，收录那些关于城市、故乡与出发的歌。',
    curator: '声屿编辑部', songCount: 4, viewCount: 6120, clickCount: 1350, favoriteCount: 201,
    isFeatured: true, isHot: false, isNew: true, category: cat(4), scene: cat(12), language: cat(21),
    tags: tagList([6, 2, 10]), publishedAt: '2026-10-30'
  },
  {
    id: 5, title: '运动燃点 · 电子节拍', slug: 'workout-beat', cover: '/images/covers/cover-5.svg',
    summary: '让心率与节拍一起上升。',
    description: '为跑步、力量训练准备的高能量电子清单，注意按自身节奏安排训练强度。',
    curator: '声屿编辑部', songCount: 4, viewCount: 5480, clickCount: 1520, favoriteCount: 178,
    isFeatured: false, isHot: true, isNew: true, category: cat(3), scene: cat(14), language: cat(22),
    tags: tagList([5, 8, 14]), publishedAt: '2026-11-01'
  },
  {
    id: 6, title: '咖啡馆爵士下午', slug: 'cafe-jazz', cover: '/images/covers/cover-6.svg',
    summary: '午后、窗边与低频铜管。',
    description: '爵士、Bossa Nova 与轻灵魂乐的下午茶清单，适合咖啡馆与居家放松。',
    curator: '声屿编辑部', songCount: 3, viewCount: 4860, clickCount: 980, favoriteCount: 164,
    isFeatured: true, isHot: false, isNew: false, category: cat(6), scene: cat(15), language: cat(22),
    tags: tagList([4, 14, 7]), publishedAt: '2026-10-22'
  },
  {
    id: 7, title: '年度私藏 · 华语流行', slug: 'pop-private', cover: '/images/covers/cover-7.svg',
    summary: '不是榜单，是我们真正反复听的十首歌。',
    description: '编辑部年度私藏，覆盖流行、摇滚与独立，拒绝自动抓取，全部人工试听后录入。',
    curator: '声屿编辑部', songCount: 4, viewCount: 7340, clickCount: 1980, favoriteCount: 240,
    isFeatured: false, isHot: true, isNew: false, category: cat(2), scene: cat(11), language: cat(21),
    tags: tagList([2, 6, 11]), publishedAt: '2026-10-18'
  },
  {
    id: 8, title: '画面之外 · 影视感配乐', slug: 'cinema-score', cover: '/images/covers/cover-8.svg',
    summary: '给短视频与混剪创作者的配乐灵感。',
    description: '按情绪与画面感整理的配乐清单，使用前请自行确认平台授权范围。',
    curator: '声屿编辑部', songCount: 4, viewCount: 3980, clickCount: 860, favoriteCount: 132,
    isFeatured: false, isHot: false, isNew: true, category: cat(7), scene: cat(16), language: cat(24),
    tags: tagList([7, 3, 12]), publishedAt: '2026-11-04'
  }
]

const songMap: Record<string, Song[]> = {
  'guofeng-shanhe': songs.guofeng,
  'midnight-city': songs.city,
  'focus-flow': songs.focus,
  'folk-faraway': songs.folk,
  'workout-beat': songs.workout,
  'cafe-jazz': songs.cafe,
  'pop-private': songs.pop,
  'cinema-score': songs.cinema
}

export const mockPlaylists: Playlist[] = base.map((p) => ({ ...p, songs: songMap[p.slug] || [] }))

export const mockArtists: Artist[] = [
  { id: 1, name: '周深', slug: 'zhou-shen', avatar: '/images/artists/artist-1.svg', country: '中国', genre: '流行 / 国风', platform: 'qq', officialUrl: qq('周深'), bio: '以空灵音色与跨风格驾驭力著称的华语歌手，作品常出现在国风与影视配乐场景。', isHot: true },
  { id: 2, name: '五月天', slug: 'mayday', avatar: '/images/artists/artist-2.svg', country: '中国台湾', genre: '摇滚 / 流行', platform: 'qq', officialUrl: qq('五月天'), bio: '华语摇滚代表乐团，用现场与旋律记录一代人的青春。', isHot: true },
  { id: 3, name: '陈粒', slug: 'chen-li', avatar: '/images/artists/artist-3.svg', country: '中国', genre: '民谣 / 独立', platform: 'netease', officialUrl: ne('陈粒'), bio: '独立音乐人，作品兼具民谣质地与实验气质。', isHot: true },
  { id: 4, name: '坂本龙一', slug: 'ryuichi-sakamoto', avatar: '/images/artists/artist-4.svg', country: '日本', genre: '古典 / 电子', platform: 'netease', officialUrl: ne('坂本龙一'), bio: '作曲家、钢琴家，以极简而深远的聲音美学影响全球。', isHot: true },
  { id: 5, name: '告五人', slug: 'accusive', avatar: '/images/artists/artist-5.svg', country: '中国台湾', genre: '流行 / 摇滚', platform: 'qq', officialUrl: qq('告五人'), bio: '以旋律与叙事见长的乐团，作品常被用于短视频与影视混剪。' },
  { id: 6, name: '房东的猫', slug: 'landlord-cat', avatar: '/images/artists/artist-6.svg', country: '中国', genre: '民谣', platform: 'netease', officialUrl: ne('房东的猫'), bio: '清新民谣组合，歌声里有校园与夏天的气息。' },
  { id: 7, name: '梁博', slug: 'liang-bo', avatar: '/images/artists/artist-7.svg', country: '中国', genre: '摇滚', platform: 'qq', officialUrl: qq('梁博'), bio: '坚持原创与现场质感的摇滚唱作人。' },
  { id: 8, name: 'Aurora', slug: 'aurora', avatar: '/images/artists/artist-8.svg', country: '挪威', genre: '流行 / 民谣', platform: 'netease', officialUrl: ne('Aurora'), bio: '北欧唱作人，以空灵声线与自然意象构建独特听觉世界。', isHot: true }
]

export const mockBanners: Banner[] = [
  { id: 1, title: '山河入梦', subtitle: '五声音阶里的东方叙事，听见山水与旧梦。', badge: '本周专题', image: '/images/banners/hero-1.svg', theme: 'indigo', linkType: 'playlist', linkValue: 'guofeng-shanhe' },
  { id: 2, title: '城市电波', subtitle: '耳机里的深夜时区，给通勤路上的你。', badge: '编辑推荐', image: '/images/banners/hero-2.svg', theme: 'violet', linkType: 'playlist', linkValue: 'midnight-city' },
  { id: 3, title: '心流时刻', subtitle: '不打扰的背景声，把注意力交还给你。', badge: '专注指南', image: '/images/banners/hero-3.svg', theme: 'gold', linkType: 'playlist', linkValue: 'focus-flow' }
]

const withCounts = (type: Category['type']) =>
  mockCategories
    .filter((c) => c.type === type)
    .map((c) => ({
      ...c,
      playlistCount: mockPlaylists.filter(
        (p) => p.category?.slug === c.slug || p.scene?.slug === c.slug || p.language?.slug === c.slug
      ).length
    }))

export const mockHome: HomeData = {
  banners: mockBanners,
  featured: mockPlaylists.filter((p) => p.isFeatured),
  styles: withCounts('style'),
  scenes: withCounts('scene'),
  languages: withCounts('language'),
  hot: mockPlaylists.filter((p) => p.isHot),
  latest: [...mockPlaylists].sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt))).slice(0, 6),
  artists: mockArtists.filter((a) => a.isHot)
}

/* ------------------------- 后台演示数据 ------------------------- */

export interface MockComplaint {
  id: number
  ticketNo: string
  name: string
  contact: string
  type: string
  targetUrl: string
  description: string
  evidenceUrl: string
  status: 'pending' | 'processing' | 'done' | 'rejected'
  reply: string
  handlerName: string
  createdAt: string
  handledAt: string
}

export const mockComplaints: MockComplaint[] = [
  {
    id: 1, ticketNo: 'CP20261103001', name: '某音乐版权代理', contact: 'rights@example.com', type: 'copyright',
    targetUrl: 'https://music.tengxiangtech.com/playlist/guofeng-shanhe', description: '该歌单中第 3 条目的封面与文字介绍涉嫌使用我方代理作品素材，请核实并下架。',
    evidenceUrl: '', status: 'pending', reply: '', handlerName: '', createdAt: '2026-11-03 10:22', handledAt: ''
  },
  {
    id: 2, ticketNo: 'CP20261028002', name: '李女士', contact: '138****6621', type: 'link',
    targetUrl: 'https://music.tengxiangtech.com/artist/zhou-shen', description: '音乐人主页链接跳转后无法打开，请更新为可用链接。',
    evidenceUrl: '', status: 'done', reply: '已核对并更新官方主页链接，感谢反馈。', handlerName: '审核员', createdAt: '2026-10-28 16:40', handledAt: '2026-10-29 09:12'
  }
]

export const mockUsers = [
  { id: 1, username: 'admin', nickname: '超级管理员', role: 'admin', status: 1, lastLoginAt: '2026-11-07 09:12', createdAt: '2026-01-01' },
  { id: 2, username: 'reviewer', nickname: '内容审核员', role: 'reviewer', status: 1, lastLoginAt: '2026-11-06 18:20', createdAt: '2026-03-12' }
]

export const mockSiteConfigRows = Object.entries({
  site_name: mockConfig.siteName,
  site_slogan: mockConfig.slogan,
  site_keywords: mockConfig.keywords,
  site_description: mockConfig.description,
  icp_no: mockConfig.icpNo,
  wenwangwen_no: mockConfig.wenwangwenNo,
  company_name: mockConfig.companyName,
  complaint_email: mockConfig.complaintEmail,
  complaint_phone: mockConfig.complaintPhone,
  disclaimer: mockConfig.disclaimer,
  privacy_policy: mockConfig.privacyPolicy,
  hot_search_words: mockConfig.hotSearchWords.join(',')
}).map(([key, value]) => ({ key, value, description: '', updatedAt: '2026-11-01' }))
