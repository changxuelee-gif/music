<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const route = useRoute()
const router = useRouter()
const admin = useAdminStore()
const mobileOpen = ref(false)

const navs = [
  { name: '数据看板', to: '/admin', icon: 'chart' },
  { name: '歌单管理', to: '/admin/playlists', icon: 'list' },
  { name: '分类与标签', to: '/admin/taxonomy', icon: 'tag' },
  { name: '音乐人', to: '/admin/artists', icon: 'user' },
  { name: '首页 Banner', to: '/admin/banners', icon: 'image' },
  { name: '投诉工单', to: '/admin/complaints', icon: 'shield' },
  { name: '站点配置', to: '/admin/site', icon: 'settings' },
  { name: '账号权限', to: '/admin/users', icon: 'lock' }
]

const pageTitle = computed(() => {
  const current = navs.find((n) => n.to === route.path)
  if (current) return current.name
  if (route.path.includes('/playlists/')) return '编辑歌单'
  return '管理后台'
})

const isActive = (to: string) => (to === '/admin' ? route.path === '/admin' : route.path.startsWith(to))

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 18) return '下午好'
  return '晚上好'
})

function logout() {
  admin.logout()
  router.push('/admin/login')
}

onMounted(async () => {
  admin.hydrate()
  admin.fetchMe()
})
</script>

<template>
  <div class="min-h-screen bg-base">
    <!-- 侧栏 -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-[236px] border-r border-line bg-soft/70 backdrop-blur-xl transition-transform lg:translate-x-0"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-[72px] items-center gap-3 border-b border-line px-5">
        <span class="grid h-9 w-9 place-items-center rounded-xl border border-line-strong bg-white/[0.06]">
          <svg viewBox="0 0 32 32" class="h-5 w-5" aria-hidden="true">
            <rect x="7" y="15" width="2.5" height="7" rx="1.25" fill="#fff" opacity=".75" />
            <rect x="11.5" y="11" width="2.5" height="15" rx="1.25" fill="#fff" />
            <rect x="16" y="7" width="2.5" height="22" rx="1.25" fill="#E8C56B" />
            <rect x="20.5" y="13" width="2.5" height="11" rx="1.25" fill="#fff" />
            <rect x="25" y="17" width="2.5" height="5" rx="1.25" fill="#fff" opacity=".75" />
          </svg>
        </span>
        <div>
          <p class="font-display text-[16px] tracking-[0.08em]">声屿</p>
          <p class="text-[9px] uppercase tracking-[0.22em] text-soft">Admin Console</p>
        </div>
      </div>

      <nav class="p-3">
        <RouterLink
          v-for="n in navs"
          :key="n.to"
          :to="n.to"
          class="group mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] transition"
          :class="isActive(n.to) ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-main' : 'text-soft hover:bg-white/[0.04] hover:text-main'"
          @click="mobileOpen = false"
        >
          <span class="h-1.5 w-1.5 rounded-full transition" :class="isActive(n.to) ? 'bg-gold-400 shadow-gold' : 'bg-white/20'"></span>
          {{ n.name }}
          <svg v-if="isActive(n.to)" viewBox="0 0 24 24" class="ml-auto h-3.5 w-3.5 text-gold/70" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </RouterLink>

        <div class="mt-4 rounded-xl border border-line bg-white/[0.02] p-3">
          <p class="text-[10px] leading-relaxed text-soft/80">
            合规提示：后台仅录入歌单元数据与正版平台外链，<span class="text-gold">禁止上传音频 / 歌词 / 音源</span>。
          </p>
        </div>
      </nav>
    </aside>

    <!-- 遮罩 -->
    <div v-if="mobileOpen" class="fixed inset-0 z-30 bg-black/60 lg:hidden" @click="mobileOpen = false"></div>

    <!-- 主区 -->
    <div class="lg:pl-[236px]">
      <header class="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b border-line bg-base/80 px-5 backdrop-blur-xl md:px-7">
        <div class="flex items-center gap-3">
          <button class="btn-icon h-9 w-9 lg:hidden" @click="mobileOpen = true" aria-label="打开菜单">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <div>
            <p class="text-[11px] text-soft">{{ greeting }}，{{ admin.user?.nickname || admin.user?.username }}</p>
            <h1 class="font-display text-[19px] leading-tight">{{ pageTitle }}</h1>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <RouterLink to="/" target="_blank" class="btn-ghost !px-3 !py-1.5 text-[11px]">
            查看前台
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4h6v6M20 4 10 14M8 6H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" /></svg>
          </RouterLink>

          <span class="hidden rounded-full border border-line px-3 py-1.5 text-[10px] text-soft sm:inline-flex">
            {{ admin.user?.role === 'admin' ? '管理员' : '审核员' }}
          </span>

          <div class="group relative">
            <button class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[12px] font-semibold text-white">
              {{ (admin.user?.nickname || 'A').slice(0, 1) }}
            </button>
            <div class="invisible absolute right-0 top-full z-30 mt-2 w-40 rounded-xl border border-line bg-elevated/95 p-1.5 text-[11px] opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              <div class="px-3 py-2 text-soft">
                <p class="text-main">{{ admin.user?.nickname || admin.user?.username }}</p>
                <p class="mt-0.5 text-[10px]">{{ admin.user?.username }}</p>
              </div>
              <button class="w-full rounded-lg px-3 py-2 text-left text-soft transition hover:bg-white/5 hover:text-main" @click="logout">退出登录</button>
            </div>
          </div>
        </div>
      </header>

      <main class="px-5 py-6 md:px-7 md:py-8">
        <router-view />
      </main>
    </div>
  </div>
</template>
