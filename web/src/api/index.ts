/** API 层：按业务域组织，页面只调用这里的方法 */
import { request, USE_MOCK } from './request'
import type {
  Artist, AuthUser, Banner, Category, HomeData, Paged, Playlist, SearchResult, SiteConfig, Tag
} from '@/types'

const get = <T>(url: string, params?: Record<string, any>) => request<T>('GET', url, { params })
const post = <T>(url: string, data?: any) => request<T>('POST', url, { data })
const put = <T>(url: string, data?: any) => request<T>('PUT', url, { data })
const patch = <T>(url: string, data?: any) => request<T>('PATCH', url, { data })
const del = <T>(url: string, params?: Record<string, any>) => request<T>('DELETE', url, { params })

/* ---------------- 公共 ---------------- */
export const siteApi = {
  config: () => get<SiteConfig>('/site/config'),
  home: () => get<HomeData>('/home'),
  categories: (type?: string) => get<Category[]>('/categories', type ? { type } : undefined),
  tags: () => get<Tag[]>('/tags')
}

export const playlistApi = {
  list: (params: Record<string, any>) => get<Paged<Playlist>>('/playlists', params),
  detail: (slug: string) => get<Playlist & { songs: any[] }>(`/playlists/${slug}`),
  search: (params: Record<string, any>) => get<SearchResult>('/search', params),
  hotSearch: () => get<{ word: string; count: number }[]>('/search/hot')
}

export const artistApi = {
  list: (params: Record<string, any>) => get<Paged<Artist>>('/artists', params),
  detail: (slug: string) => get<Artist>(`/artists/${slug}`)
}

/* ---------------- 用户 ---------------- */
export const authApi = {
  login: (data: { username: string; password: string }) => post<{ token: string; user: AuthUser }>('/auth/login', data),
  register: (data: { username: string; password: string; nickname?: string }) =>
    post<{ token: string; user: AuthUser }>('/auth/register', data),
  me: () => get<AuthUser>('/auth/me')
}

export const favoriteApi = {
  list: () => get<any>('/favorites'),
  add: (targetType: 'playlist' | 'artist', targetId: number) => post('/favorites', { targetType, targetId }),
  remove: (targetType: 'playlist' | 'artist', targetId: number) => del('/favorites', { targetType, targetId }),
  check: (targetType: 'playlist' | 'artist', targetId: number) =>
    get<{ favorited: boolean }>('/favorites/check', { targetType, targetId })
}

/* ---------------- 投诉 / 埋点 ---------------- */
export const complaintApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string }>('POST', '/complaints/upload', { data: form })
  },
  submit: (data: Record<string, any>) => post<{ ticketNo: string }>('/complaints', data)
}

export const statsApi = {
  visit: (payload: { path: string; referer?: string; visitorId: string }) => post('/stats/visit', payload),
  click: (songId: number, playlistId: number) => post('/stats/click', { songId, playlistId })
}

/* ---------------- 后台 ---------------- */
export const adminApi = {
  login: (data: { username: string; password: string }) => post<{ token: string; user: AuthUser }>('/admin/auth/login', data),
  me: () => get<AuthUser>('/admin/auth/me'),
  dashboard: () => get<any>('/admin/dashboard/overview'),

  playlists: (params: Record<string, any>) => get<Paged<any>>('/admin/playlists', params),
  playlist: (id: number) => get<any>(`/admin/playlists/${id}`),
  createPlaylist: (data: any) => post<{ id: number; slug: string }>('/admin/playlists', data),
  updatePlaylist: (id: number, data: any) => put<{ id: number; slug: string }>(`/admin/playlists/${id}`, data),
  playlistStatus: (id: number, status: number) => patch(`/admin/playlists/${id}/status`, { status }),
  deletePlaylist: (id: number) => del(`/admin/playlists/${id}`),
  validateUrl: (url: string) => post<{ allowed: boolean; platform: string }>('/admin/playlists/validate-url', { url }),

  categories: () => get<any[]>('/admin/categories'),
  createCategory: (data: any) => post('/admin/categories', data),
  updateCategory: (id: number, data: any) => put(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) => del(`/admin/categories/${id}`),

  tags: () => get<any[]>('/admin/tags'),
  createTag: (data: any) => post('/admin/tags', data),
  updateTag: (id: number, data: any) => put(`/admin/tags/${id}`, data),
  deleteTag: (id: number) => del(`/admin/tags/${id}`),

  artists: () => get<any[]>('/admin/artists'),
  createArtist: (data: any) => post('/admin/artists', data),
  updateArtist: (id: number, data: any) => put(`/admin/artists/${id}`, data),
  deleteArtist: (id: number) => del(`/admin/artists/${id}`),

  banners: () => get<Banner[]>('/admin/banners'),
  createBanner: (data: any) => post('/admin/banners', data),
  updateBanner: (id: number, data: any) => put(`/admin/banners/${id}`, data),
  deleteBanner: (id: number) => del(`/admin/banners/${id}`),

  complaints: (params: Record<string, any>) => get<Paged<any>>('/admin/complaints', params),
  complaint: (id: number) => get<any>(`/admin/complaints/${id}`),
  handleComplaint: (id: number, data: { status: string; reply: string }) => patch(`/admin/complaints/${id}`, data),

  siteConfig: () => get<any[]>('/admin/site/config'),
  saveSiteConfig: (items: { key: string; value: string }[]) => put('/admin/site/config', { items }),

  users: (params: Record<string, any>) => get<Paged<any>>('/admin/users', params),
  createUser: (data: any) => post('/admin/users', data),
  updateUser: (id: number, data: any) => put(`/admin/users/${id}`, data),

  uploadImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ url: string; provider: string }>('POST', '/admin/upload/image', { data: form })
  },
  uploadConfig: () => get<{ provider: string; maxMb: number }>('/admin/upload/config')
}

export { USE_MOCK }
