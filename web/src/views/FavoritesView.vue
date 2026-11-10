<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { favoriteApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useSeo } from '@/composables/useSeo'
import EmptyState from '@/components/EmptyState.vue'

const auth = useAuthStore()
const loading = ref(true)
const tab = ref<'playlist' | 'artist'>('playlist')
const playlists = ref<any[]>([])
const artists = ref<any[]>([])
const toast = ref('')

useSeo({ title: '我的收藏' })

async function load() {
  loading.value = true
  try {
    const res = await favoriteApi.list()
    playlists.value = res.playlists || []
    artists.value = res.artists || []
  } catch (e) {
    console.warn(e)
  } finally {
    loading.value = false
  }
}

async function remove(type: 'playlist' | 'artist', id: number) {
  try {
    await favoriteApi.remove(type, id)
    if (type === 'playlist') playlists.value = playlists.value.filter((p) => p.targetId !== id)
    else artists.value = artists.value.filter((a) => a.targetId !== id)
    toast.value = '已取消收藏'
    setTimeout(() => { toast.value = '' }, 2200)
  } catch (e: any) {
    toast.value = e.message
  }
}

onMounted(() => {
  auth.fetchMe()
  load()
})
</script>

<template>
  <div class="shell pt-10">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold"><span class="h-px w-6 bg-gold-400/60"></span>My Collection</p>
        <h1 class="mt-3 font-display text-[32px] md:text-[40px]">我的收藏</h1>
        <p class="mt-2 text-[13px] text-soft">登录后可收藏歌单与音乐人，收藏数据仅与你的账号关联。</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded-full px-4 py-2 text-[12px] transition" :class="tab === 'playlist' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'border border-line text-soft'" @click="tab = 'playlist'">
          歌单 {{ playlists.length }}
        </button>
        <button class="rounded-full px-4 py-2 text-[12px] transition" :class="tab === 'artist' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'border border-line text-soft'" @click="tab = 'artist'">
          音乐人 {{ artists.length }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-36 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>

    <template v-else>
      <div v-if="tab === 'playlist'" class="mt-8">
        <div v-if="playlists.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="p in playlists" :key="p.targetId" class="glass-card group overflow-hidden">
            <RouterLink :to="`/playlist/${p.slug}`" class="flex gap-4 p-4">
              <div v-if="p.cover" class="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <img :src="p.cover" :alt="p.title" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
              <div class="min-w-0 flex-1">
                <p class="clamp-2 text-[14px] transition group-hover:text-gold">{{ p.title }}</p>
                <p class="mt-1 line-clamp-2 text-[11px] text-soft">{{ p.summary }}</p>
                <p class="mt-2 text-[10px] text-soft/60">{{ p.songCount }} 首</p>
              </div>
            </RouterLink>
            <div class="border-t border-line px-4 py-2 text-right">
              <button class="text-[11px] text-soft/70 transition hover:text-red-300" @click="remove('playlist', p.targetId)">取消收藏</button>
            </div>
          </div>
        </div>
        <EmptyState v-else title="还没有收藏歌单" desc="在歌单详情页点击「收藏歌单」，就会出现在这里。">
          <RouterLink to="/category" class="btn-primary mt-6 text-[12px]">去发现歌单</RouterLink>
        </EmptyState>
      </div>

      <div v-else class="mt-8">
        <div v-if="artists.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="a in artists" :key="a.targetId" class="glass-card group flex items-center gap-4 p-4">
            <RouterLink :to="`/artist/${a.slug}`" class="flex min-w-0 flex-1 items-center gap-4">
              <div v-if="a.avatar" class="h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <img :src="a.avatar" :alt="a.name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
              <div class="min-w-0">
                <p class="truncate text-[14px] transition group-hover:text-gold">{{ a.name }}</p>
                <p class="mt-1 truncate text-[11px] text-soft">{{ a.genre }}</p>
              </div>
            </RouterLink>
            <button class="shrink-0 text-[11px] text-soft/70 transition hover:text-red-300" @click="remove('artist', a.targetId)">取消</button>
          </div>
        </div>
        <EmptyState v-else title="还没有收藏音乐人" desc="在音乐人详情页收藏后，会出现在这里。" />
      </div>
    </template>

    <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">
      {{ toast }}
    </div>
  </div>
</template>
