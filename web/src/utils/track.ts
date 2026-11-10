import { statsApi } from '@/api'
import { PLATFORM_COLORS, PLATFORM_LABELS } from './platform'

/** 匿名访客 ID（仅用于 UV 统计，不含个人信息） */
export function getVisitorId(): string {
  let id = localStorage.getItem('fh_visitor_id')
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
    localStorage.setItem('fh_visitor_id', id)
  }
  return id
}

export function trackVisit(path: string) {
  if (path.startsWith('/admin')) return
  statsApi
    .visit({ path, referer: document.referrer, visitorId: getVisitorId() })
    .catch(() => {})
}

export function platformLabel(key?: string) {
  return PLATFORM_LABELS[key || ''] || '正版平台'
}

export function platformColor(key?: string) {
  return PLATFORM_COLORS[key || ''] || '#5B6CFF'
}

/**
 * 打开正版平台页面（新标签页，noopener 防钓鱼）
 * 先上报点击统计，失败不阻塞跳转
 */
export async function openSong(url: string, songId?: number, playlistId?: number) {
  if (songId && playlistId) {
    statsApi.click(songId, playlistId).catch(() => {})
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}
