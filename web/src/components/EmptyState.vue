<script setup lang="ts">
defineProps<{ title?: string; desc?: string }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
    <span class="mb-4 grid h-12 w-12 place-items-center rounded-full border border-line bg-white/[0.03] text-soft">
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" />
      </svg>
    </span>
    <p class="font-display text-[16px]">{{ title || '暂时没有内容' }}</p>
    <p class="mt-2 max-w-sm text-[12px] leading-relaxed text-soft">{{ desc || '换个筛选条件试试，或者回到首页发现更多歌单。' }}</p>
    <slot />
  </div>
</template>
