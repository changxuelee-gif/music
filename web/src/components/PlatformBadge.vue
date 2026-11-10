<script setup lang="ts">
import { platformColor, platformLabel } from '@/utils/track'

withDefaults(defineProps<{ platform?: string; compact?: boolean }>(), { compact: false })
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] font-medium text-soft"
    :class="compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'"
  >
    <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: platformColor(platform), boxShadow: `0 0 8px ${platformColor(platform)}` }"></span>
    {{ platformLabel(platform) }}
  </span>
</template>
