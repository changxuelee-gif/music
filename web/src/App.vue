<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ParticleBackdrop from '@/components/ParticleBackdrop.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { useSiteStore } from '@/stores/site'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const site = useSiteStore()

onMounted(async () => {
  await site.load()
  // 注入三方统计代码（后台不注入）
  if (isAdmin.value) return
  const code = site.config?.analyticsCode
  if (!code || !code.trim()) return
  try {
    const doc = new DOMParser().parseFromString(code, 'text/html')
    doc.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script')
      if (old.src) s.src = old.src
      if (old.async) s.async = true
      if (old.defer) s.defer = true
      s.textContent = old.textContent
      document.head.appendChild(s)
    })
  } catch (e) {
    console.warn('[analytics] 统计代码注入失败', e)
  }
})
</script>

<template>
  <ParticleBackdrop v-if="!isAdmin" />
  <AppHeader v-if="!isAdmin" />

  <main :class="isAdmin ? '' : 'relative z-10 min-h-screen'">
    <router-view />
  </main>

  <AppFooter v-if="!isAdmin" />
</template>
