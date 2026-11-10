<script setup lang="ts">
import type { Playlist } from '@/types'
import { computed } from 'vue'

const props = defineProps<{ playlist: Playlist; rank?: number }>()

const flags = computed(() => {
  const f: { label: string; class: string }[] = []
  if (props.playlist.isFeatured) f.push({ label: '编辑精选', class: 'border-gold-400/40 bg-gold-400/10 text-gold' })
  if (props.playlist.isHot) f.push({ label: '热门', class: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-400' })
  if (props.playlist.isNew) f.push({ label: '新收录', class: 'border-violet-400/40 bg-violet-500/10 text-violet-400' })
  return f.slice(0, 2)
})
</script>

<template>
  <RouterLink :to="`/playlist/${playlist.slug}`" class="group glass-card grad-border block overflow-hidden">
    <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900">
      <img
        v-if="playlist.cover"
        :src="playlist.cover"
        :alt="playlist.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span
          v-for="f in flags"
          :key="f.label"
          class="rounded-full border px-2 py-0.5 text-[10px] backdrop-blur-md"
          :class="f.class"
        >{{ f.label }}</span>
      </div>

      <div class="absolute right-3 top-3 rounded-full border border-white/15 bg-black/35 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur-md">
        {{ playlist.songCount }} 首
      </div>

      <div v-if="rank" class="absolute bottom-3 left-3 font-display text-[42px] leading-none text-gold/80">
        {{ String(rank).padStart(2, '0') }}
      </div>

      <div class="absolute inset-x-3 bottom-3 flex items-center justify-between">
        <span class="chip !border-white/15 !bg-black/30 !text-white/70 backdrop-blur-md">{{ playlist.category?.name || '精选' }}</span>
        <span class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </div>
    </div>

    <div class="p-4">
      <h3 class="clamp-2 font-display text-[17px] leading-snug transition group-hover:text-gold">{{ playlist.title }}</h3>
      <p class="clamp-2 mt-1.5 text-[12px] leading-relaxed text-soft">{{ playlist.summary }}</p>
      <div class="mt-3 flex flex-wrap items-center gap-1.5">
        <span v-for="t in playlist.tags.slice(0, 2)" :key="t.id" class="chip !text-[10px]">{{ t.name }}</span>
        <span class="text-[10px] text-soft/70">· {{ playlist.curator || '编辑部' }}</span>
      </div>
    </div>
  </RouterLink>
</template>
