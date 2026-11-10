/**
 * 前端 Mock 运行时（VITE_USE_MOCK=true 时路由到本地演示数据）
 * 目的：在没有 MySQL/Redis 的环境下也能完整体验用户端与后台交互
 */
import type { Playlist, Song } from '@/types'
import { PLATFORM_LABELS } from '@/utils/platform'
import {
  mockArtists, mockBanners, mockCategories, mockConfig, mockHome, mockPlaylists,
  mockSiteConfigRows, mockTags, mockUsers, mockComplaints
} from './data'

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

let playlists: Playlist[] = clone(mockPlaylists)
let artists = clone(mockArtists)
let banners = clone(mockBanners)
let categories = clone(mockCategories)
let tags = clone(mockTags)
let complaints = clone(mockComplaints)
let siteConfig = clone(mockSiteConfigRows)
let playlistSeq = 100
let complaintSeq = 100

const FAV_KEY = 'fh_mock_favorites'
function readFav(): { userId: number; targetType: string; targetId: number }[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
}
function writeFav(v: unknown) { localStorage.setItem(FAV_KEY, JSON.stringify(v)) }

function pageOf<T>(list: T[], params: Record<string, any>, defaultSize = 12) {
  const page = Math.max(1, Number(params.page) || 1)
  const pageSize = Math.min(60, Number(params.pageSize) || defaultSize)
  return {
    list: list.slice((page - 1) * pageSize, page * pageSize),
    total: list.length,
    page,
    pageSize,
    totalPages: Math.ceil(list.length / pageSize)
  }
}

const byId = (id: number) => playlists.find((p) => p.id === id)

function decorate(p: Playlist): Playlist {
  return {
    ...p,
    tags: (p.tags || []).map((t) => tags.find((x) => x.id === t.id) || t),
    songCount: p.songs ? p.songs.filter((s) => (s as any).status !== 0).length : p.songCount,
    platformLabels: undefined
  } as Playlist
}

function listPlaylists(params: Record<string, any>) {
  let list = playlists.filter((p) => (p as any).status !== 0)
  if (params.category) list = list.filter((p) => p.category?.slug === params.category)
  if (params.scene) list = list.filter((p) => p.scene?.slug === params.scene)
  if (params.language) list = list.filter((p) => p.language?.slug === params.language)
  if (params.tags) {
    const ids = String(params.tags).split(',').map(Number)
    list = list.filter((p) => ids.every((id) => p.tags.some((t) => t.id === id)))
  }
  const sort = params.sort || 'default'
  list = [...list]
  if (sort === 'hot') list.sort((a, b) => Number(b.isHot) - Number(a.isHot) || (b.clickCount || 0) - (a.clickCount || 0))
  else if (sort === 'new') list.sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)))
  else if (sort === 'click') list.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
  return pageOf(list.map(decorate), params)
}

function relatedOf(p: Playlist) {
  return playlists
    .filter((x) => x.id !== p.id && (x.category?.slug === p.category?.slug || x.scene?.slug === p.scene?.slug))
    .slice(0, 4)
    .map(decorate)
}

function searchAll(q: string, params: Record<string, any>) {
  const kw = q.trim().toLowerCase()
  if (!kw) return { keyword: '', total: 0, playlists: [], songs: [], artists: [], tags: [], page: 1, pageSize: 8, totalPages: 0 }

  const hit = (s?: string) => String(s || '').toLowerCase().includes(kw)
  const pl = playlists.filter((p) => hit(p.title) || hit(p.summary) || hit(p.description)
    || p.tags.some((t) => hit(t.name))
    || (p.songs || []).some((s) => hit(s.title) || hit(s.artistName))
    || [p.category?.name, p.scene?.name, p.language?.name].some(hit))

  const songHits: (Song & { playlistId: number; playlistTitle: string; playlistSlug: string })[] = []
  playlists.forEach((p) => (p.songs || []).forEach((s) => {
    if (hit(s.title) || hit(s.artistName)) songHits.push({ ...s, playlistId: p.id, playlistTitle: p.title, playlistSlug: p.slug })
  }))

  return {
    keyword: q,
    total: pl.length,
    ...pageOf(pl.map(decorate), params, 8),
    playlists: pageOf(pl.map(decorate), params, 8).list,
    songs: songHits.slice(0, 10),
    artists: artists.filter((a) => hit(a.name) || hit(a.genre) || hit(a.bio)).slice(0, 6),
    tags: tags.filter((t) => hit(t.name)).slice(0, 10)
  }
}

function adminOverview() {
  const today = new Date()
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return {
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      pv: [1260, 1480, 1390, 1720, 1950, 2130, 2380][i],
      uv: [620, 740, 690, 880, 990, 1040, 1180][i]
    }
  })
  return {
    today: { pv: trend[6].pv, uv: trend[6].uv },
    yesterday: { pv: trend[5].pv, uv: trend[5].uv },
    trend,
    totals: {
      playlists: playlists.length,
      songs: playlists.reduce((n, p) => n + (p.songs?.length || 0), 0),
      artists: artists.length,
      users: 1286,
      complaints: complaints.length,
      pendingComplaints: complaints.filter((c) => c.status === 'pending').length
    },
    topPlaylists: [...playlists].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0)).slice(0, 8).map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover, viewCount: p.viewCount,
      clickCount: p.clickCount, favoriteCount: p.favoriteCount, songCount: p.songs?.length
    })),
    hotKeywords: mockConfig.hotSearchWords.map((w, i) => ({ word: w, count: 96 - i * 11 })),
    platformDistribution: [
      { platform: 'qq', count: 1260 }, { platform: 'netease', count: 980 },
      { platform: 'kugou', count: 420 }, { platform: 'qishui', count: 210 }
    ],
    recentComplaints: complaints.slice(0, 5).map((c) => ({
      id: c.id, ticketNo: c.ticketNo, name: c.name, type: c.type, status: c.status, createdAt: c.createdAt
    }))
  }
}

function mockLogin(path: string, body: Record<string, any>) {
  if (path.includes('/admin/')) {
    const u = String(body.username || '')
    const p = String(body.password || '')
    if ((u === 'admin' && p === 'Admin@123456') || (u === 'reviewer' && p === 'Review@123')) {
      const role = u === 'admin' ? 'admin' : 'reviewer'
      return {
        token: `mock-admin-${role}`,
        user: { id: u === 'admin' ? 1 : 2, username: u, nickname: role === 'admin' ? '超级管理员' : '内容审核员', role }
      }
    }
    throw new Error('演示账号：admin / Admin@123456 或 reviewer / Review@123')
  }
  const username = String(body.username || 'musicfan')
  return {
    token: 'mock-user-token',
    user: { id: 9, username, nickname: username, role: 'user' }
  }
}

/**
 * 统一 Mock 入口
 * @returns 已解包的业务数据
 */
export function mockRequest(method: string, path: string, params: Record<string, any> = {}, body: Record<string, any> = {}) {
  const m = method.toUpperCase()
  const seg = path.replace(/^\/api/, '').split('?')[0]
  const parts = seg.split('/').filter(Boolean)

  /* ---------------- 公共 ---------------- */
  if (seg === '/site/config' && m === 'GET') return clone(mockConfig)
  if (seg === '/home' && m === 'GET') return clone(mockHome)
  if (seg === '/categories' && m === 'GET') {
    const type = params.type
    const list = type ? categories.filter((c) => c.type === type) : categories
    return clone(list)
  }
  if (seg === '/tags' && m === 'GET') return clone(tags)

  if (seg === '/playlists' && m === 'GET') return listPlaylists(params)
  if (parts[0] === 'playlists' && parts.length === 2 && m === 'GET') {
    const p = playlists.find((x) => x.slug === parts[1])
    if (!p) throw new Error('歌单不存在或已下架')
    p.viewCount += 1
    return { ...decorate(p), songs: p.songs || [], related: relatedOf(p) }
  }

  if (seg === '/artists' && m === 'GET') {
    let list = artists.filter((a) => (a as any).status !== 0)
    if (params.genre) list = list.filter((a) => String(a.genre).includes(params.genre))
    if (params.keyword) list = list.filter((a) => `${a.name}${a.genre}${a.bio}`.includes(params.keyword))
    return pageOf(clone(list), params)
  }
  if (parts[0] === 'artists' && parts.length === 2 && m === 'GET') {
    const a = artists.find((x) => x.slug === parts[1])
    if (!a) throw new Error('音乐人不存在')
    const rel = playlists.filter((p) => (p.songs || []).some((s) => s.artistName === a.name)).map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover, summary: p.summary, songCount: p.songCount
    }))
    return { ...clone(a), playlists: rel, related: artists.filter((x) => x.id !== a.id).slice(0, 4) }
  }

  if (seg === '/search' && m === 'GET') return searchAll(String(params.q || ''), params)
  if (seg === '/search/hot' && m === 'GET') return mockConfig.hotSearchWords.map((w) => ({ word: w, count: 0 }))

  if (seg === '/complaints' && m === 'POST') {
    complaintSeq += 1
    const ticketNo = `CP20261107${complaintSeq}`
    complaints.unshift({
      id: complaintSeq, ticketNo, name: String(body.name || ''), contact: String(body.contact || ''),
      type: String(body.type || 'copyright'), targetUrl: String(body.targetUrl || ''),
      description: String(body.description || ''), evidenceUrl: String(body.evidenceUrl || ''),
      status: 'pending', reply: '', handlerName: '', createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), handledAt: ''
    })
    return { ticketNo, status: 'pending' }
  }
  if (seg === '/complaints/upload' && m === 'POST') {
    return { url: '/images/covers/cover-3.svg', provider: 'mock' }
  }
  if (seg === '/stats/visit' || seg === '/stats/click') return null

  if (seg === '/auth/login' && m === 'POST') return mockLogin(seg, body)
  if (seg === '/auth/register' && m === 'POST') return mockLogin(seg, body)
  if (seg === '/auth/me' && m === 'GET') return { id: 9, username: 'musicfan', nickname: '音乐漫游者', role: 'user' }

  if (seg === '/favorites/check' && m === 'GET') {
    const favs = readFav()
    return { favorited: favs.some((f) => f.targetType === params.targetType && f.targetId === Number(params.targetId)) }
  }
  if (seg === '/favorites' && m === 'GET') {
    const favs = readFav()
    const pl = favs.filter((f) => f.targetType === 'playlist').map((f) => {
      const p = byId(f.targetId)
      return p ? { id: p.id, targetId: p.id, title: p.title, slug: p.slug, cover: p.cover, summary: p.summary, songCount: p.songCount } : null
    }).filter(Boolean)
    const ar = favs.filter((f) => f.targetType === 'artist').map((f) => {
      const a = artists.find((x) => x.id === f.targetId)
      return a ? { id: a.id, targetId: a.id, name: a.name, slug: a.slug, avatar: a.avatar, genre: a.genre } : null
    }).filter(Boolean)
    return { list: [], total: favs.length, page: 1, pageSize: 12, playlists: pl, artists: ar, summary: { playlist: pl.length, artist: ar.length } }
  }
  if (seg === '/favorites' && m === 'POST') {
    const favs = readFav().filter((f) => !(f.targetType === body.targetType && f.targetId === body.targetId))
    favs.push({ userId: 9, targetType: body.targetType, targetId: Number(body.targetId) })
    writeFav(favs)
    return { favorited: true }
  }
  if (seg === '/favorites' && m === 'DELETE') {
    const favs = readFav().filter((f) => !(f.targetType === params.targetType && f.targetId === Number(params.targetId)))
    writeFav(favs)
    return { favorited: false }
  }

  /* ---------------- 后台 ---------------- */
  if (seg === '/admin/auth/login' && m === 'POST') return mockLogin(seg, body)
  if (seg === '/admin/auth/me' && m === 'GET') return { id: 1, username: 'admin', nickname: '超级管理员', role: 'admin' }
  if (seg === '/admin/dashboard/overview' && m === 'GET') return adminOverview()

  if (seg === '/admin/playlists' && m === 'GET') {
    let list = [...playlists]
    if (params.status !== undefined && params.status !== '') list = list.filter((p) => Number((p as any).status ?? 1) === Number(params.status))
    if (params.keyword) list = list.filter((p) => p.title.includes(params.keyword) || p.slug.includes(params.keyword))
    return pageOf(list.map((p) => ({
      id: p.id, title: p.title, slug: p.slug, cover: p.cover, summary: p.summary,
      songCount: p.songs?.length || 0, viewCount: p.viewCount, clickCount: p.clickCount || 0,
      isFeatured: p.isFeatured, isHot: p.isHot, isNew: p.isNew, status: (p as any).status ?? 1,
      sort: (p as any).sort ?? 0, categoryName: p.category?.name, sceneName: p.scene?.name,
      languageName: p.language?.name, updatedAt: p.publishedAt
    })), params)
  }
  if (parts[0] === 'admin' && parts[1] === 'playlists' && parts[2] && m === 'GET') {
    const p = playlists.find((x) => x.id === Number(parts[2]))
    if (!p) throw new Error('歌单不存在')
    return {
      ...decorate(p), description: p.description, categoryId: p.category?.id, sceneId: p.scene?.id,
      languageId: p.language?.id, curator: p.curator, tagIds: p.tags.map((t) => t.id),
      seoTitle: '', seoKeywords: '', seoDesc: '',
      songs: (p.songs || []).map((s) => ({ ...s, status: 1, sort: 10 }))
    }
  }
  if (seg === '/admin/playlists' && m === 'POST') {
    playlistSeq += 1
    const slug = String(body.slug || `new-playlist-${playlistSeq}`)
    const category = categories.find((c) => c.id === Number(body.categoryId)) || null
    const scene = categories.find((c) => c.id === Number(body.sceneId)) || null
    const language = categories.find((c) => c.id === Number(body.languageId)) || null
    const p: Playlist = {
      id: playlistSeq, title: body.title, slug, cover: body.cover || '/images/covers/cover-1.svg',
      summary: body.summary || '', description: body.description || '', curator: body.curator || '声屿编辑部',
      songCount: body.songs?.length || 0, viewCount: 0, clickCount: 0, favoriteCount: 0,
      isFeatured: !!body.isFeatured, isHot: !!body.isHot, isNew: !!body.isNew,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      scene: scene ? { id: scene.id, name: scene.name, slug: scene.slug } : null,
      language: language ? { id: language.id, name: language.name, slug: language.slug } : null,
      tags: (body.tagIds || []).map((id: number) => tags.find((t) => t.id === id)).filter(Boolean),
      publishedAt: new Date().toISOString().slice(0, 10),
      songs: (body.songs || []).map((s: any, i: number) => ({
        id: 1000 + i, title: s.title, artistName: s.artistName, platform: s.platform,
        platformLabel: PLATFORM_LABELS[s.platform], url: s.url, duration: s.duration, cover: s.cover
      }))
    }
    ;(p as any).status = body.status === 0 ? 0 : 1
    playlists.unshift(p)
    return { id: p.id, slug }
  }
  if (parts[0] === 'admin' && parts[1] === 'playlists' && parts[2] && m === 'PUT') {
    const id = Number(parts[2])
    const p = byId(id)
    if (!p) throw new Error('歌单不存在')
    Object.assign(p, {
      title: body.title, slug: body.slug, cover: body.cover, summary: body.summary,
      description: body.description, curator: body.curator,
      isFeatured: !!body.isFeatured, isHot: !!body.isHot, isNew: !!body.isNew,
      tags: (body.tagIds || []).map((tid: number) => tags.find((t) => t.id === tid)).filter(Boolean),
      songs: (body.songs || []).map((s: any, i: number) => ({
        id: 1000 + i, title: s.title, artistName: s.artistName, platform: s.platform,
        platformLabel: PLATFORM_LABELS[s.platform], url: s.url, duration: s.duration, cover: s.cover
      }))
    })
    ;(p as any).status = body.status === 0 ? 0 : 1
    return { id, slug: p.slug }
  }
  if (parts[0] === 'admin' && parts[1] === 'playlists' && parts[3] === 'status' && m === 'PATCH') {
    const p = byId(Number(parts[2]))
    if (p) (p as any).status = body.status === 0 ? 0 : 1
    return { id: Number(parts[2]), status: (p as any)?.status }
  }
  if (parts[0] === 'admin' && parts[1] === 'playlists' && parts[2] && m === 'DELETE') {
    playlists = playlists.filter((p) => p.id !== Number(parts[2]))
    return null
  }
  if (seg === '/admin/playlists/validate-url' && m === 'POST') {
    const allowed = mockConfig.allowedDomains.some((d) => {
      try { return new URL(body.url).hostname.endsWith(d) } catch { return false }
    })
    return { allowed, platform: String(body.url).includes('163.com') ? 'netease' : 'qq' }
  }

  if (seg === '/admin/categories' && m === 'GET') {
    return categories.map((c) => ({ ...c, status: 1, sort: 10 }))
  }
  if (seg === '/admin/categories' && m === 'POST') {
    const c = { ...body, id: 200 + categories.length, status: 1 }
    categories.push(c)
    return { id: c.id, slug: c.slug }
  }
  if (parts[0] === 'admin' && parts[1] === 'categories' && m === 'PUT') {
    const c = categories.find((x) => x.id === Number(parts[2]))
    if (c) Object.assign(c, body, { status: body.status === 0 ? 0 : 1 })
    return { id: Number(parts[2]) }
  }
  if (parts[0] === 'admin' && parts[1] === 'categories' && m === 'DELETE') {
    categories = categories.filter((x) => x.id !== Number(parts[2]))
    return null
  }

  if (seg === '/admin/tags' && m === 'GET') return tags.map((t) => ({ ...t, status: 1, usedCount: 3 }))
  if (seg === '/admin/tags' && m === 'POST') {
    const t = { ...body, id: 300 + tags.length, status: 1 }
    tags.push(t)
    return { id: t.id }
  }
  if (parts[0] === 'admin' && parts[1] === 'tags' && m === 'PUT') {
    const t = tags.find((x) => x.id === Number(parts[2]))
    if (t) Object.assign(t, body)
    return { id: Number(parts[2]) }
  }
  if (parts[0] === 'admin' && parts[1] === 'tags' && m === 'DELETE') {
    tags = tags.filter((x) => x.id !== Number(parts[2]))
    return null
  }

  if (seg === '/admin/artists' && m === 'GET') return clone(artists).map((a) => ({ ...a, status: 1, sort: 10, playlistCount: 2 }))
  if (seg === '/admin/artists' && m === 'POST') {
    const a = { ...body, id: 400 + artists.length, status: 1 }
    artists.push(a)
    return { id: a.id }
  }
  if (parts[0] === 'admin' && parts[1] === 'artists' && m === 'PUT') {
    const a = artists.find((x) => x.id === Number(parts[2]))
    if (a) Object.assign(a, body)
    return { id: Number(parts[2]) }
  }
  if (parts[0] === 'admin' && parts[1] === 'artists' && m === 'DELETE') {
    artists = artists.filter((x) => x.id !== Number(parts[2]))
    return null
  }

  if (seg === '/admin/banners' && m === 'GET') return clone(banners).map((b) => ({ ...b, status: 1, sort: 10, position: 'home_hero' }))
  if (seg === '/admin/banners' && m === 'POST') {
    const b = { ...body, id: 500 + banners.length, status: 1 }
    banners.push(b)
    return { id: b.id }
  }
  if (parts[0] === 'admin' && parts[1] === 'banners' && m === 'PUT') {
    const b = banners.find((x) => x.id === Number(parts[2]))
    if (b) Object.assign(b, body)
    return { id: Number(parts[2]) }
  }
  if (parts[0] === 'admin' && parts[1] === 'banners' && m === 'DELETE') {
    banners = banners.filter((x) => x.id !== Number(parts[2]))
    return null
  }

  if (seg === '/admin/complaints' && m === 'GET') {
    let list = complaints
    if (params.status) list = list.filter((c) => c.status === params.status)
    return pageOf(clone(list), params)
  }
  if (parts[0] === 'admin' && parts[1] === 'complaints' && parts[2] && m === 'GET') {
    return clone(complaints.find((c) => c.id === Number(parts[2])))
  }
  if (parts[0] === 'admin' && parts[1] === 'complaints' && parts[2] && m === 'PATCH') {
    const c = complaints.find((x) => x.id === Number(parts[2]))
    if (c) {
      c.status = body.status
      c.reply = body.reply || ''
      c.handlerName = '超级管理员'
      if (['done', 'rejected'].includes(body.status)) c.handledAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    }
    return { id: Number(parts[2]), status: body.status }
  }

  if (seg === '/admin/site/config' && m === 'GET') return clone(siteConfig)
  if (seg === '/admin/site/config' && m === 'PUT') {
    ;(body.items || []).forEach((item: any) => {
      const row = siteConfig.find((r) => r.key === item.key)
      if (row) row.value = item.value
    })
    return null
  }

  if (seg === '/admin/users' && m === 'GET') return pageOf(clone(mockUsers), params)
  if (seg === '/admin/upload/image' && m === 'POST') return { url: '/images/covers/cover-2.svg', provider: 'mock' }
  if (seg === '/admin/upload/config' && m === 'GET') return { provider: 'mock', maxMb: 5 }

  throw new Error(`Mock 未实现的接口：${m} ${seg}`)
}
