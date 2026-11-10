<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { playlistApi } from '@/api'
import type { SearchResult } from '@/types'
import { useSeo } from '@/composables/useSeo'
import { openSong } from '@/utils/track'
import PlaylistCard from '@/components/PlaylistCard.vue'
import ArtistCard from '@/components/ArtistCard.vue'
import PlatformBadge from '@/components/PlatformBadge.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const keyword = ref(String(route.query.q || ''))
const result = ref<SearchResult | null>(null)
const hotWords = ref<{ word: string; count: number }[]>([])
const loading = ref(false)
const page = ref(1)

useSeo({ title: keyword.value ? `搜索「${keyword.value}」` : '全站搜索', description: '搜索歌单、歌曲、歌手、音乐人与标签，全部来自站内人工录入数据。' })

const hasResult = computed(() => Boolean(result.value && (result.value.playlists.length || result.value.songs.length || result.value.artists.length || result.value.tags.length)))

async function search() {
  const q = keyword.value.trim()
  if (!q) {
    result.value = null
    return
  }
  loading.value = true
  try {
    result.value = await playlistApi.search({ q, page: page.value, pageSize: 8 })
  } catch (e) {
    result.value = null
  } finally {
    loading.value = false
  }
}

function submit() {
  const q = keyword.value.trim()
  if (!q) return
  page.value = 1
  router.push({ path: '/search', query: { q } })
}

function useHot(word: string) {
  keyword.value = word
  submit()
}

function goPage(p: number) {
  if (!result.value || p < 1 || p > result.value.totalPages) return
  page.value = p
  search()
}

watch(() => route.query.q, (q) => {
  const next = String(q || '')
  if (next !== keyword.value) keyword.value = next
  page.value = 1
  search()
})

onMounted(async () => {
  hotWords.value = await playlistApi.hotSearch().catch(() => [])
  if (keyword.value) search()
})
</script>

<template>
  <div class="shell pt-10">
    <div class="mx-auto max-w-3xl text-center">
      <p class="text-[11px] uppercase tracking-[0.3em] text-gold">Search</p>
      <h1 class="mt-3 font-display text-[32px] md:text-[40px]">发现你想听的声音</h1>
      <p class="mt-3 text-[13px] text-soft">支持歌单、歌曲、歌手、音乐人与标签检索，数据全部来自站内人工录入。</p>

      <form class="relative mt-8" @submit.prevent="submit">
        <svg viewBox="0 0 24 24" class="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-soft" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
        </svg>
        <input
          v-model="keyword"
          class="field h-14 rounded-full !pl-14 !pr-32 text-[14px]"
          placeholder="试试「国风」「深夜」「周深」…"
          autofocus
        />
        <button class="btn-primary absolute right-2 top-1/2 h-10 -translate-y-1/2 px-5">搜索</button>
      </form>

      <div v-if="!result" class="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span class="text-[11px] text-soft">热门搜索</span>
        <button v-for="h in hotWords" :key="h.word" class="chip transition hover:border-gold-400/50 hover:text-gold" @click="useHot(h.word)">
          {{ h.word }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="i in 4" :key="i" class="h-64 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>

    <template v-else-if="result">
      <div class="mt-12 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <p class="text-[12px] text-soft">
          「<span class="text-main">{{ result.keyword }}</span>」共找到
          <span class="text-gold">{{ result.total }}</span> 个歌单，
          {{ result.songs.length }} 首歌曲，{{ result.artists.length }} 位音乐人
        </p>
        <p class="text-[11px] text-soft/60">按相关度与编辑推荐排序</p>
      </div>

      <div v-if="!hasResult" class="mt-8">
        <EmptyState title="没有找到相关内容" desc="换个关键词试试，或者浏览首页的精选歌单。" />
      </div>

      <template v-else>
        <!-- 歌单 -->
        <section v-if="result.playlists.length" class="mt-9">
          <h2 class="mb-4 font-display text-[22px]">歌单</h2>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <PlaylistCard v-for="p in result.playlists" :key="p.id" :playlist="p as any" />
          </div>
          <div v-if="result.totalPages > 1" class="mt-7 flex items-center justify-center gap-3 text-[12px]">
            <button class="btn-ghost text-[12px]" :disabled="page <= 1" :class="{ 'opacity-30': page <= 1 }" @click="goPage(page - 1)">上一页</button>
            <span class="text-soft">{{ page }} / {{ result.totalPages }}</span>
            <button class="btn-ghost text-[12px]" :disabled="page >= result.totalPages" :class="{ 'opacity-30': page >= result.totalPages }" @click="goPage(page + 1)">下一页</button>
          </div>
        </section>

        <!-- 歌曲 -->
        <section v-if="result.songs.length" class="mt-12">
          <h2 class="mb-4 font-display text-[22px]">歌曲</h2>
          <div class="overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
            <div
              v-for="s in result.songs"
              :key="s.id"
              class="group flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-white/[0.04] md:px-5"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-[14px] transition group-hover:text-gold">{{ s.title }}</p>
                <p class="mt-0.5 text-[11px] text-soft">{{ s.artistName }}</p>
              </div>
              <RouterLink :to="`/playlist/${s.playlistSlug}`" class="hidden max-w-[220px] truncate text-[11px] text-soft/70 transition hover:text-gold sm:block">
                收录于「{{ s.playlistTitle }}」
              </RouterLink>
              <PlatformBadge :platform="s.platform" compact />
              <button class="btn-ghost shrink-0 !px-3 !py-1.5 text-[11px] hover:!border-gold-400/60 hover:!text-gold" @click="openSong(s.url, s.id, s.playlistId)">
                去收听 ↗
              </button>
            </div>
          </div>
        </section>

        <!-- 音乐人 -->
        <section v-if="result.artists.length" class="mt-12">
          <h2 class="mb-4 font-display text-[22px]">音乐人</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <ArtistCard v-for="a in result.artists" :key="a.id" :artist="a as any" />
          </div>
        </section>

        <!-- 标签 -->
        <section v-if="result.tags.length" class="mt-12">
          <h2 class="mb-4 font-display text-[22px]">相关标签</h2>
          <div class="flex flex-wrap gap-2">
            <RouterLink
              v-for="t in result.tags"
              :key="t.id"
              :to="`/category?tag=${t.slug}`"
              class="rounded-full border border-line px-4 py-2 text-[12px] text-soft transition hover:border-gold-400/40 hover:text-gold"
            >
              # {{ t.name }}
            </RouterLink>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>
