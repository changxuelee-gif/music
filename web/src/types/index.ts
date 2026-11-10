/** 前端数据类型定义（与后端 API 返回保持一致） */

export interface Tag {
  id: number
  name: string
  slug: string
  color?: string
  type?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  type: 'style' | 'scene' | 'language'
  icon?: string
  color?: string
  intro?: string
  playlistCount?: number
}

export interface Playlist {
  id: number
  title: string
  slug: string
  cover: string
  summary: string
  description?: string
  curator?: string
  songCount: number
  viewCount: number
  clickCount?: number
  favoriteCount?: number
  isFeatured?: boolean
  isHot?: boolean
  isNew?: boolean
  category?: { id: number; name: string; slug: string } | null
  scene?: { id: number; name: string; slug: string } | null
  language?: { id: number; name: string; slug: string } | null
  tags: Tag[]
  publishedAt?: string
  songs?: Song[]
  related?: Playlist[]
}

export interface Song {
  id: number
  title: string
  artistName: string
  artistId?: number | null
  platform: PlatformKey
  platformLabel?: string
  url: string
  cover?: string
  duration?: string
}

export type PlatformKey = 'qq' | 'netease' | 'kugou' | 'qishui' | 'kuwo' | 'migu'

export interface Artist {
  id: number
  name: string
  slug: string
  avatar: string
  country?: string
  genre?: string
  platform?: PlatformKey
  officialUrl: string
  bio?: string
  isHot?: boolean
  playlists?: Partial<Playlist>[]
  related?: Partial<Artist>[]
}

export interface Banner {
  id: number
  title: string
  subtitle?: string
  badge?: string
  image: string
  theme?: 'indigo' | 'violet' | 'gold'
  linkType: 'playlist' | 'artist' | 'category' | 'none'
  linkValue?: string
}

export interface SiteConfig {
  siteName: string
  slogan: string
  keywords: string
  description: string
  companyName: string
  icpNo: string
  wenwangwenNo: string
  complaintEmail: string
  complaintPhone: string
  disclaimer: string
  privacyPolicy: string
  hotSearchWords: string[]
  platforms: { key: string; label: string }[]
  allowedDomains: string[]
  analyticsCode: string
}

export interface HomeData {
  banners: Banner[]
  featured: Playlist[]
  styles: Category[]
  scenes: Category[]
  languages: Category[]
  hot: Playlist[]
  latest: Playlist[]
  artists: Artist[]
}

export interface Paged<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SearchResult {
  keyword: string
  total: number
  page: number
  pageSize: number
  totalPages: number
  playlists: Partial<Playlist>[]
  songs: (Song & { playlistId: number; playlistTitle: string; playlistSlug: string })[]
  artists: Partial<Artist>[]
  tags: Tag[]
}

export interface AuthUser {
  id: number
  username: string
  nickname: string
  avatar?: string
  role: 'admin' | 'reviewer' | 'user'
}
