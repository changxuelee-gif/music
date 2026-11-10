<script setup lang="ts">
defineProps<{ kicker?: string; title: string; desc?: string }>()
</script>

<template>
  <div class="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p v-if="kicker" class="mb-2.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold/90">
        <span class="h-px w-6 bg-gold-400/60"></span>
        {{ kicker }}
      </p>
      <h2 class="font-display text-[26px] leading-tight text-main md:text-[32px]">{{ title }}</h2>
      <p v-if="desc" class="mt-2 max-w-2xl text-[13px] leading-relaxed text-soft">{{ desc }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
