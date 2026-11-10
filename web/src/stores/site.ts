import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SiteConfig } from '@/types'
import { siteApi } from '@/api'

export const useSiteStore = defineStore('site', () => {
  const config = ref<SiteConfig | null>(null)
  const loading = ref(false)

  async function load() {
    if (config.value || loading.value) return config.value
    loading.value = true
    try {
      config.value = await siteApi.config()
    } catch (e) {
      console.warn('[site] 配置加载失败', e)
    } finally {
      loading.value = false
    }
    return config.value
  }

  return { config, loading, load }
})
