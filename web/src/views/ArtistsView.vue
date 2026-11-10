<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { artistApi } from '@/api'
import type { Artist, Paged } from '@/types'
import { useSeo } from '@/composables/useSeo'
import ArtistCard from '@/components/ArtistCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const data = ref<Paged<Artist> | null>(null)
const keyword = ref('')
const page = ref(1)
const loading = ref(false)

useSeo({ title: '音乐人导航', description: '收录华语与海外音乐人，点击音乐人卡片可直接前往正版平台官方主页。' })

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => Boolean(data.value && page.value < data.value.totalPages))

async function load() {
  loading.value = true
  try {
    data.value = await artistApi.list({ page: page.value, pageSize: 12, keyword: keyword.value || undefined })
  } catch (e) {
    data.value = { list: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

function go(p: number) {
  page.value = p
  load()
  window.scrollTo({ top: 200, behavior: 'smooth' })
}

onMounted(load)
</script>

<template>
  <div class="shell pt-10">
    <div class="relative overflow-hidden rounded-[24px] border border-line bg-soft/50 px-6 py-10 md:px-10">
      <div class="aurora -right-16 -top-24 h-72 w-72" style="background: radial-gradient(circle, rgba(232,197,107,.28), transparent 65%)"></div>
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div class="max-w-2xl">
          <p class="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold"><span class="h-px w-6 bg-gold-400/60"></span>Artists</p>
          <h1 class="mt-4 font-display text-[34px] leading-tight md:text-[44px]">音乐人导航</h1>
          <p class="mt-3 text-[13px] leading-relaxed text-soft">
            按风格整理的音乐人索引。点击卡片进入详情，或直接前往正版平台的音乐人官方主页。
          </p>
        </div>
        <form class="flex w-full items-center gap-2 md:w-auto" @submit.prevent="search">
          <input v-model="keyword" class="field h-10 md:w-56" placeholder="搜索音乐人 / 风格" />
          <button class="btn-primary h-10 shrink-0 px-4 text-[12px]">搜索</button>
        </form>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between text-[12px] text-soft">
      <span>共 <span class="text-main">{{ data?.total || 0 }}</span> 位音乐人</span>
      <span class="text-[11px] text-soft/60">官方主页链接均经过域名白名单校验</span>
    </div>

    <div v-if="loading" class="mt-5 grid gap-4 md:grid-cols-2">
      <div v-for="i in 6" :key="i" class="h-28 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>

    <div v-else-if="data?.list.length" class="mt-5 grid gap-4 md:grid-cols-2">
      <ArtistCard v-for="a in data.list" :key="a.id" :artist="a" />
    </div>

    <EmptyState v-else class="mt-8" title="没有找到匹配的音乐人" desc="换个关键词，或浏览全部音乐人。" />

    <div v-if="data && data.totalPages > 1" class="mt-9 flex items-center justify-center gap-3">
      <button class="btn-ghost text-[12px]" :disabled="!canPrev" :class="{ 'opacity-30': !canPrev }" @click="go(page - 1)">上一页</button>
      <span class="text-[12px] text-soft">{{ page }} / {{ data.totalPages }}</span>
      <button class="btn-ghost text-[12px]" :disabled="!canNext" :class="{ 'opacity-30': !canNext }" @click="go(page + 1)">下一页</button>
    </div>
  </div>
</template>
