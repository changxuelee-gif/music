import { watchEffect, onUnmounted } from 'vue'

const BASE = '声屿音乐导航'
const DEFAULT_DESC = '声屿是精品人工音乐导航发现站，按风格、场景、音乐人组织歌单，帮助音乐爱好者与短视频创作者发现好音乐，并直达正版音乐平台。'

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOg(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * 前端动态 meta（配合后端 seoInjector 形成双保险）
 */
export function useSeo(options: { title: string; description?: string; image?: string }) {
  const previousTitle = document.title

  watchEffect(() => {
    document.title = options.title ? `${options.title} - ${BASE}` : BASE
    const desc = options.description || DEFAULT_DESC
    setMeta('description', desc)
    setOg('og:title', document.title)
    setOg('og:description', desc)
    if (options.image) setOg('og:image', options.image)
  })

  onUnmounted(() => {
    document.title = previousTitle || BASE
  })
}
