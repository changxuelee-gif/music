<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isDark, toggle } = useTheme()

const keyword = ref('')
const mobileOpen = ref(false)
const userOpen = ref(false)

const navs = [
  { name: '首页', to: '/' },
  { name: '分类', to: '/category' },
  { name: '音乐人', to: '/artists' },
  { name: '搜索', to: '/search' },
  { name: '我的收藏', to: '/favorites' }
]

const activePath = computed(() => route.path)

function submitSearch() {
  const q = keyword.value.trim()
  if (!q) return
  mobileOpen.value = false
  router.push({ path: '/search', query: { q } })
}

watch(() => route.fullPath, () => {
  mobileOpen.value = false
  userOpen.value = false
})

function logout() {
  auth.logout()
  userOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50">
    <div class="border-b border-line bg-base/80 backdrop-blur-xl">
      <div class="shell flex h-[72px] items-center justify-between gap-4">
        <!-- Logo -->
        <RouterLink to="/" class="group flex items-center gap-3">
          <span class="relative grid h-10 w-10 place-items-center rounded-2xl border border-line-strong bg-white/[0.06]">
            <svg viewBox="0 0 32 32" class="h-6 w-6" aria-hidden="true">
              <rect x="7" y="15" width="2.5" height="7" rx="1.25" fill="#fff" opacity=".75" />
              <rect x="11.5" y="11" width="2.5" height="15" rx="1.25" fill="#fff" />
              <rect x="16" y="7" width="2.5" height="22" rx="1.25" fill="#E8C56B" />
              <rect x="20.5" y="13" width="2.5" height="11" rx="1.25" fill="#fff" />
              <rect x="25" y="17" width="2.5" height="5" rx="1.25" fill="#fff" opacity=".75" />
            </svg>
            <span class="absolute -inset-px rounded-2xl opacity-0 ring-1 ring-indigo-500/50 transition group-hover:opacity-100"></span>
          </span>
          <span class="leading-none">
            <span class="block font-display text-[19px] tracking-[0.12em]">声屿</span>
            <span class="mt-1 block text-[10px] uppercase tracking-[0.28em] text-soft">Music Navigator</span>
          </span>
        </RouterLink>

        <!-- 桌面导航 -->
        <nav class="hidden items-center gap-1 lg:flex">
          <RouterLink
            v-for="n in navs"
            :key="n.to"
            :to="n.to"
            class="relative rounded-full px-4 py-2 text-[13px] text-soft transition hover:text-main"
            :class="activePath === n.to || (n.to !== '/' && activePath.startsWith(n.to)) ? '!text-main' : ''"
          >
            {{ n.name }}
            <span
              v-if="activePath === n.to || (n.to !== '/' && activePath.startsWith(n.to))"
              class="absolute inset-x-3 -bottom-[1px] h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
            ></span>
          </RouterLink>
        </nav>

        <!-- 右侧操作 -->
        <div class="flex items-center gap-2">
          <form class="hidden items-center md:flex" @submit.prevent="submitSearch">
            <div class="relative">
              <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
              </svg>
              <input
                v-model="keyword"
                type="search"
                placeholder="搜索歌单 / 歌曲 / 音乐人"
                class="h-9 w-[218px] rounded-full border border-line bg-white/[0.04] pl-9 pr-3 text-[12px] text-main outline-none transition placeholder:text-soft/70 focus:w-[260px] focus:border-indigo-500/60"
                aria-label="站内搜索"
              />
            </div>
          </form>

          <button class="btn-icon" :title="isDark ? '切换浅色主题' : '切换深色主题'" @click="toggle">
            <svg v-if="isDark" viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M20.5 14.2A8.7 8.7 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z" />
            </svg>
          </button>

          <!-- 用户 -->
          <div v-if="auth.isLoggedIn" class="relative hidden sm:block">
            <button class="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition hover:border-line-strong" @click="userOpen = !userOpen">
              <span class="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white">
                {{ (auth.user?.nickname || 'U').slice(0, 1) }}
              </span>
              <span class="max-w-[80px] truncate text-[12px]">{{ auth.user?.nickname || auth.user?.username }}</span>
            </button>
            <div v-if="userOpen" class="absolute right-0 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-elevated/95 p-1.5 text-[12px] shadow-xl backdrop-blur-xl">
              <RouterLink to="/favorites" class="block rounded-lg px-3 py-2 text-soft transition hover:bg-white/5 hover:text-main">我的收藏</RouterLink>
              <button class="block w-full rounded-lg px-3 py-2 text-left text-soft transition hover:bg-white/5 hover:text-main" @click="logout">退出登录</button>
            </div>
          </div>
          <RouterLink v-else to="/login" class="hidden rounded-full border border-line-strong px-4 py-2 text-[12px] transition hover:border-gold-400/50 hover:text-gold sm:inline-flex">
            登录
          </RouterLink>

          <!-- 移动端菜单按钮 -->
          <button class="btn-icon lg:hidden" @click="mobileOpen = !mobileOpen" aria-label="打开菜单">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8">
              <path v-if="!mobileOpen" d="M4 7h16M4 12h16M4 17h16" />
              <path v-else d="m6 6 12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端展开区 -->
      <div v-if="mobileOpen" class="border-t border-line bg-base/95 px-5 py-4 backdrop-blur-xl lg:hidden">
        <form class="mb-3 flex items-center gap-2" @submit.prevent="submitSearch">
          <input v-model="keyword" class="field h-10" placeholder="搜索歌单 / 歌曲 / 音乐人" />
          <button class="btn-primary h-10 shrink-0 px-4">搜索</button>
        </form>
        <div class="grid grid-cols-2 gap-2">
          <RouterLink v-for="n in navs" :key="n.to" :to="n.to" class="rounded-xl border border-line px-3 py-2.5 text-[13px] text-soft">
            {{ n.name }}
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
