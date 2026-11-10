<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { artistApi } from '@/api'
import type { Artist } from '@/types'
import { useSeo } from '@/composables/useSeo'
import { platformLabel } from '@/utils/track'
import EmptyState from '@/components/EmptyState.vue'
import PlatformBadge from '@/components/PlatformBadge.vue'

const route = useRoute()
const artist = ref<Artist | null>(null)
const loading = ref(true)
const error = ref('')

const slug = computed(() => String(route.params.slug || ''))

useSeo({ title: artist.value?.name || '音乐人' })

async function load() {
  loading.value = true
  try {
    artist.value = await artistApi.detail(slug.value)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function goOfficial() {
  if (!artist.value) return
  window.open(artist.value.officialUrl, '_blank', 'noopener,noreferrer')
}

onMounted(load)
</script>

<template>
  <div class="shell pt-8">
    <nav class="flex items-center gap-2 text-[11px] text-soft/70">
      <RouterLink to="/" class="transition hover:text-gold">首页</RouterLink>
      <span>/</span>
      <RouterLink to="/artists" class="transition hover:text-gold">音乐人</RouterLink>
      <span>/</span>
      <span class="text-soft">{{ artist?.name || '详情' }}</span>
    </nav>

    <div v-if="loading" class="mt-6 h-64 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <EmptyState v-else-if="error" class="mt-10" title="音乐人不可用" :desc="error">
      <RouterLink to="/artists" class="btn-primary mt-6 text-[12px]">返回音乐人列表</RouterLink>
    </EmptyState>

    <template v-else-if="artist">
      <section class="relative mt-5 overflow-hidden rounded-[26px] border border-line bg-soft/50 p-6 md:p-9">
        <div class="aurora -right-20 -top-24 h-72 w-72" style="background: radial-gradient(circle, rgba(91,108,255,.4), transparent 65%)"></div>
        <div class="relative flex flex-col gap-7 md:flex-row md:items-center">
          <div class="relative h-32 w-32 shrink-0 md:h-40 md:w-40">
            <div v-if="artist.avatar" class="h-full w-full overflow-hidden rounded-full border border-line-strong">
              <img :src="artist.avatar" :alt="artist.name" class="h-full w-full object-cover" />
            </div>
            <div v-else class="h-full w-full rounded-full border border-line-strong bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
            <span class="absolute -inset-1 rounded-full ring-1 ring-gold-400/25"></span>
            <span v-if="artist.isHot" class="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-gold-400/40 bg-base px-2.5 py-0.5 text-[9px] tracking-[0.16em] text-gold">HOT ARTIST</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-3">
              <span class="chip">🎵 {{ artist.genre }}</span>
              <span class="chip">{{ artist.country }}</span>
              <PlatformBadge :platform="artist.platform" />
            </div>
            <h1 class="mt-4 font-display text-[34px] leading-tight md:text-[42px]">{{ artist.name }}</h1>
            <p class="mt-3 max-w-2xl text-[13px] leading-relaxed text-soft">{{ artist.bio }}</p>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button class="btn-gold" @click="goOfficial">
                前往官方主页 ↗
              </button>
              <span class="text-[11px] text-soft/60">将新开标签跳转至{{ platformLabel(artist.platform) }}官方页面</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 关联歌单 -->
      <section class="mt-12">
        <div class="mb-5 flex items-end justify-between">
          <div>
            <p class="text-[11px] uppercase tracking-[0.26em] text-gold">Playlists</p>
            <h2 class="mt-2 font-display text-[24px]">收录于这些歌单</h2>
          </div>
        </div>

        <div v-if="artist.playlists?.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="p in artist.playlists"
            :key="p.id!"
            :to="`/playlist/${p.slug}`"
            class="group glass-card flex items-center gap-4 p-4"
          >
            <div v-if="p.cover" class="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
              <img :src="p.cover" :alt="p.title" class="h-full w-full object-cover" />
            </div>
            <div v-else class="h-16 w-16 shrink-0 rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[14px] transition group-hover:text-gold">{{ p.title }}</p>
              <p class="mt-1 truncate text-[11px] text-soft">{{ p.summary }}</p>
              <p class="mt-1 text-[10px] text-soft/60">{{ p.songCount }} 首</p>
            </div>
            <svg viewBox="0 0 24 24" class="h-4 w-4 text-soft" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </RouterLink>
        </div>
        <div v-else class="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-[12px] text-soft">
          暂无歌单关联到该音乐人，可在后台为歌曲条目绑定音乐人。
        </div>
      </section>

      <!-- 相关音乐人 -->
      <section v-if="artist.related?.length" class="mt-12">
        <div class="mb-5">
          <p class="text-[11px] uppercase tracking-[0.26em] text-gold">More Artists</p>
          <h2 class="mt-2 font-display text-[24px]">相似风格的音乐人</h2>
        </div>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            v-for="a in artist.related"
            :key="a.id!"
            :to="`/artist/${a.slug}`"
            class="glass-card flex items-center gap-3 px-4 py-3"
          >
            <div v-if="a.avatar" class="h-9 w-9 shrink-0 overflow-hidden rounded-full">
              <img :src="a.avatar" :alt="a.name" class="h-full w-full object-cover" />
            </div>
            <div v-else class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
            <span class="text-[12px]">{{ a.name }}</span>
            <span class="text-[10px] text-soft">{{ a.genre }}</span>
          </RouterLink>
        </div>
      </section>
    </template>
  </div>
</template>
