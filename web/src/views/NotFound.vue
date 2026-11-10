<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
useSeo({ title: '页面不存在' })
</script>

<template>
  <div class="shell flex min-h-[70vh] flex-col items-center justify-center pt-10 text-center">
    <p class="font-display text-[86px] leading-none text-white/[0.08]">404</p>
    <h1 class="-mt-4 font-display text-[28px]">这段旋律不在这里</h1>
    <p class="mt-3 max-w-md text-[13px] leading-relaxed text-soft">页面可能已被移动或下架。回到首页，继续发现好音乐。</p>
    <div class="mt-8 flex gap-3">
      <RouterLink to="/" class="btn-gold text-[12px]">返回首页</RouterLink>
      <RouterLink to="/category" class="btn-ghost text-[12px]">浏览歌单</RouterLink>
    </div>
  </div>
</template>
