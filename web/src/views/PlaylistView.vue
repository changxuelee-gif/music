<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { favoriteApi, playlistApi } from '@/api'
import type { Playlist } from '@/types'
import { useSeo } from '@/composables/useSeo'
import { useAuthStore } from '@/stores/auth'
import { openSong, platformLabel } from '@/utils/track'
import PlatformBadge from '@/components/PlatformBadge.vue'
import PlaylistCard from '@/components/PlaylistCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const playlist = ref<(Playlist & { songs: any[] }) | null>(null)
const loading = ref(true)
const error = ref('')
const favorited = ref(false)
const favBusy = ref(false)
const toast = ref('')

useSeo({ title: '歌单详情', description: '人工策展歌单，点击去收听直达正版音乐平台。' })

const slug = computed(() => String(route.params.slug || ''))

const platforms = computed(() => {
  if (!playlist.value) return []
  const set = new Map<string, string>()
  playlist.value.songs.forEach((s: any) => set.set(s.platform, s.platformLabel || platformLabel(s.platform)))
  return Array.from(set.entries())
})

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2600)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    playlist.value = await playlistApi.detail(slug.value)
    document.title = `${playlist.value.title} - 声屿音乐导航`
    if (auth.isLoggedIn) {
      const res = await favoriteApi.check('playlist', playlist.value.id).catch(() => ({ favorited: false }))
      favorited.value = res.favorited
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!playlist.value) return
  if (!auth.isLoggedIn) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  favBusy.value = true
  try {
    if (favorited.value) {
      await favoriteApi.remove('playlist', playlist.value.id)
      favorited.value = false
      showToast('已取消收藏')
    } else {
      await favoriteApi.add('playlist', playlist.value.id)
      favorited.value = true
      showToast('已加入收藏')
    }
  } catch (e: any) {
    showToast(e.message)
  } finally {
    favBusy.value = false
  }
}

function listen(song: any) {
  if (!playlist.value) return
  openSong(song.url, song.id, playlist.value.id)
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToast('链接已复制')
  } catch {
    showToast('复制失败，请手动复制地址栏链接')
  }
}

onMounted(load)
</script>

<template>
  <div class="shell pt-8">
    <!-- 面包屑 -->
    <nav class="flex flex-wrap items-center gap-2 text-[11px] text-soft/70">
      <RouterLink to="/" class="transition hover:text-gold">首页</RouterLink>
      <span>/</span>
      <RouterLink to="/category" class="transition hover:text-gold">歌单</RouterLink>
      <span>/</span>
      <span class="text-soft">{{ playlist?.category?.name || '详情' }}</span>
    </nav>

    <div v-if="loading" class="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
      <div class="h-72 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
      <div class="h-72 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>

    <EmptyState v-else-if="error" class="mt-10" title="歌单不可用" :desc="error">
      <RouterLink to="/category" class="btn-primary mt-6 text-[12px]">返回分类列表</RouterLink>
    </EmptyState>

    <template v-else-if="playlist">
      <!-- 头部卡片 -->
      <section class="relative mt-6 overflow-hidden rounded-[26px] border border-line bg-soft/50">
        <div class="absolute inset-0 opacity-40" style="background: radial-gradient(ellipse at 85% 0%, rgba(91,108,255,.45), transparent 55%)"></div>
        <div class="relative grid gap-7 p-6 md:p-8 lg:grid-cols-[260px_1fr]">
          <div class="relative">
            <div v-if="playlist.cover" class="aspect-square w-full overflow-hidden rounded-2xl border border-line-strong shadow-2xl">
              <img :src="playlist.cover" :alt="playlist.title" class="h-full w-full object-cover" />
            </div>
            <div v-else class="aspect-square w-full rounded-2xl border border-line-strong bg-gradient-to-br from-indigo-900/60 to-purple-900/40 shadow-2xl"></div>
            <div class="absolute inset-x-4 bottom-4 flex items-end justify-between">
              <div class="flex items-end gap-[2px] opacity-70">
                <span v-for="i in 12" :key="i" class="wave-bar !w-[2px]" :style="{ height: `${10 + (i % 5) * 5}px`, animationDelay: `${i * 0.1}s` }"></span>
              </div>
              <span class="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur">{{ playlist.songCount }} 首</span>
            </div>
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="playlist.isFeatured" class="chip !border-gold-400/40 !text-gold">编辑精选</span>
              <span v-if="playlist.isHot" class="chip !border-indigo-400/40 !text-indigo-400">热门</span>
              <span v-if="playlist.isNew" class="chip !border-violet-400/40 !text-violet-400">新收录</span>
              <span class="chip">{{ playlist.scene?.name || playlist.category?.name }}</span>
            </div>

            <h1 class="mt-4 font-display text-[32px] leading-tight md:text-[40px]">{{ playlist.title }}</h1>
            <p class="mt-3 max-w-2xl text-[13px] leading-relaxed text-soft">{{ playlist.summary }}</p>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span v-for="t in playlist.tags" :key="t.id" class="chip">
                <span class="h-1 w-1 rounded-full" :style="{ background: t.color || '#e8c56b' }"></span>{{ t.name }}
              </span>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-soft">
              <span>策展人：<span class="text-main">{{ playlist.curator }}</span></span>
              <span>浏览 {{ playlist.viewCount }}</span>
              <span>收藏 {{ playlist.favoriteCount }}</span>
              <span v-if="playlist.publishedAt">上架 {{ String(playlist.publishedAt).slice(0, 10) }}</span>
            </div>

            <div class="mt-7 flex flex-wrap items-center gap-3">
              <button class="btn-gold" :disabled="favBusy" @click="toggleFavorite">
                <svg viewBox="0 0 24 24" class="h-4 w-4" :fill="favorited ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.7">
                  <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z" />
                </svg>
                {{ favorited ? '已收藏' : '收藏歌单' }}
              </button>
              <button class="btn-ghost text-[12px]" @click="copyLink">复制链接</button>
              <div class="ml-auto flex items-center gap-1.5">
                <span class="text-[10px] text-soft/60">来源平台</span>
                <PlatformBadge v-for="[key] in platforms" :key="key" :platform="key" compact />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 歌单介绍 + 歌曲列表 -->
      <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-display text-[22px]">歌单曲目</h2>
            <p class="text-[11px] text-soft/60">共 {{ playlist.songs.length }} 条 · 仅提供跳转</p>
          </div>

          <div class="overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
            <div class="hidden grid-cols-[44px_1fr_150px_90px_110px] items-center gap-3 border-b border-line px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-soft/60 md:grid">
              <span>#</span><span>歌曲</span><span>来源平台</span><span>时长</span><span class="text-right">操作</span>
            </div>

            <div
              v-for="(song, idx) in playlist.songs"
              :key="song.id"
              class="group grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3.5 transition last:border-b-0 hover:bg-white/[0.04] md:grid-cols-[44px_1fr_150px_90px_110px] md:px-5"
            >
              <span class="hidden font-display text-[14px] text-soft/50 md:block">{{ String(idx + 1).padStart(2, '0') }}</span>

              <div class="min-w-0">
                <p class="truncate text-[14px] transition group-hover:text-gold">{{ song.title }}</p>
                <p class="mt-0.5 truncate text-[11px] text-soft">{{ song.artistName }}</p>
                <div class="mt-1.5 md:hidden"><PlatformBadge :platform="song.platform" compact /></div>
              </div>

              <div class="hidden md:block"><PlatformBadge :platform="song.platform" compact /></div>
              <span class="hidden text-[11px] text-soft/70 md:block">{{ song.duration || '—' }}</span>

              <div class="text-right">
                <button class="btn-ghost !px-3 !py-1.5 text-[11px] hover:!border-gold-400/60 hover:!text-gold" @click="listen(song)">
                  去收听 ↗
                </button>
              </div>
            </div>

            <div v-if="!playlist.songs.length" class="px-6 py-12 text-center text-[12px] text-soft">该歌单暂未录入歌曲条目。</div>
          </div>

          <div class="mt-4 flex items-start gap-2 rounded-xl border border-line bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-soft/80">
            <span class="mt-0.5 text-gold">ⓘ</span>
            <p>「去收听」会在新标签页打开对应正版音乐平台官方页面，本站不存储、不播放任何音频，也不提供歌词与音源下载。</p>
          </div>
        </div>

        <!-- 侧栏 -->
        <aside class="space-y-5">
          <div class="glass-card p-5">
            <p class="text-[11px] uppercase tracking-[0.2em] text-soft">About this playlist</p>
            <p class="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-soft">{{ playlist.description || playlist.summary }}</p>
            <div class="mt-5 space-y-2 border-t border-line pt-4 text-[11px] text-soft">
              <div class="flex justify-between"><span>风格</span><span class="text-main">{{ playlist.category?.name || '—' }}</span></div>
              <div class="flex justify-between"><span>场景</span><span class="text-main">{{ playlist.scene?.name || '—' }}</span></div>
              <div class="flex justify-between"><span>语种</span><span class="text-main">{{ playlist.language?.name || '—' }}</span></div>
              <div class="flex justify-between"><span>曲目</span><span class="text-main">{{ playlist.songCount }} 首</span></div>
            </div>
          </div>

          <RouterLink to="/complaint" class="glass-card block p-5">
            <p class="font-display text-[15px]">版权投诉</p>
            <p class="mt-2 text-[11px] leading-relaxed text-soft">如认为本页信息侵犯您的合法权益，可提交权属材料，我们依法处理。</p>
            <span class="mt-3 inline-block text-[11px] text-gold">前往投诉入口 →</span>
          </RouterLink>
        </aside>
      </div>

      <!-- 相关推荐 -->
      <section v-if="playlist.related?.length" class="mt-16">
        <div class="mb-5 flex items-end justify-between">
          <div>
            <p class="text-[11px] uppercase tracking-[0.26em] text-gold">Related</p>
            <h2 class="mt-2 font-display text-[24px]">你可能也会喜欢</h2>
          </div>
          <RouterLink to="/category" class="text-[11px] text-soft transition hover:text-gold">更多歌单 →</RouterLink>
        </div>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PlaylistCard v-for="p in playlist.related" :key="p.id" :playlist="p" />
        </div>
      </section>
    </template>

    <!-- 轻提示 -->
    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] text-main shadow-xl backdrop-blur-xl">
        {{ toast }}
      </div>
    </Transition>
  </div>
</template>
