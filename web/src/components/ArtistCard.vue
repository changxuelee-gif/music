<script setup lang="ts">
import type { Artist } from '@/types'

defineProps<{ artist: Artist }>()
</script>

<template>
  <RouterLink :to="`/artist/${artist.slug}`" class="group glass-card flex items-center gap-4 p-4">
    <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-line-strong bg-gradient-to-br from-indigo-900/60 to-purple-900/40">
      <img v-if="artist.avatar" :src="artist.avatar" :alt="artist.name" loading="lazy" class="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
      <span class="absolute inset-0 rounded-full ring-1 ring-gold-400/20"></span>
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h3 class="truncate font-display text-[16px] transition group-hover:text-gold">{{ artist.name }}</h3>
        <span v-if="artist.isHot" class="rounded-full border border-gold-400/35 px-1.5 py-0.5 text-[9px] text-gold">HOT</span>
      </div>
      <p class="mt-1 truncate text-[12px] text-soft">{{ artist.country }} · {{ artist.genre }}</p>
      <p class="mt-1.5 truncate text-[11px] text-soft/70">{{ artist.bio }}</p>
    </div>
    <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-soft transition group-hover:text-gold" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </RouterLink>
</template>
