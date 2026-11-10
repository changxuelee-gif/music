<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { playlistApi, siteApi } from '@/api'
import type { Category, Paged, Playlist, Tag } from '@/types'
import { useSeo } from '@/composables/useSeo'
import SectionTitle from '@/components/SectionTitle.vue'
import PlaylistCard from '@/components/PlaylistCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()

const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const type = ref<'style' | 'scene' | 'language'>('style')
const selectedSlug = ref('')
const selectedTags = ref<number[]>([])
const sort = ref('default')
const page = ref(1)
const pageSize = 12
const data = ref<Paged<Playlist> | null>(null)
const loading = ref(false)

const typeTabs = [
  { key: 'style', label: '风格' },
  { key: 'scene', label: '场景' },
  { key: 'language', label: '语种' }
] as const

const typeCategories = computed(() => categories.value.filter((c) => c.type === type.value))

const currentCategory = computed(() => categories.value.find((c) => c.slug === selectedSlug.value) || null)

const title = computed(() => currentCategory.value?.name ? `${currentCategory.value.name}歌单` : '全部歌单')
const description = computed(
  () => currentCategory.value?.intro || '按风格、场景、语种与标签筛选人工策展歌单，点击直达正版音乐平台。'
)

useSeo({ title: title.value, description: description.value })

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => Boolean(data.value && page.value < data.value.totalPages))
const pageNumbers = computed(() => {
  const total = data.value?.totalPages || 0
  const start = Math.max(1, Math.min(page.value - 2, total - 4))
  return Array.from({ length: Math.min(5, total) }, (_, i) => start + i)
})

async function load() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      sort: sort.value,
      page: page.value,
      pageSize
    }
    if (selectedSlug.value) params[type.value] = selectedSlug.value
    if (selectedTags.value.length) params.tags = selectedTags.value.join(',')
    data.value = await playlistApi.list(params)
  } catch (e) {
    console.warn(e)
    data.value = { list: [], total: 0, page: 1, pageSize, totalPages: 0 }
  } finally {
    loading.value = false
  }
}

function syncFromRoute() {
  const slug = String(route.params.slug || '')
  selectedSlug.value = slug
  if (slug) {
    const cat = categories.value.find((c) => c.slug === slug)
    if (cat) type.value = cat.type
  }
  page.value = 1
  load()
}

function switchType(t: 'style' | 'scene' | 'language') {
  if (type.value === t) return
  type.value = t
  selectedSlug.value = ''
  selectedTags.value = []
  page.value = 1
  router.push('/category')
  load()
}

function selectCategory(slug: string) {
  selectedSlug.value = slug
  page.value = 1
  if (slug) router.push(`/category/${slug}`)
  else {
    router.push('/category')
    load()
  }
}

function toggleTag(id: number) {
  const i = selectedTags.value.indexOf(id)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(id)
  page.value = 1
  load()
}

function changeSort() {
  page.value = 1
  load()
}

function goPage(p: number) {
  if (p < 1 || (data.value && p > data.value.totalPages)) return
  page.value = p
  load()
  window.scrollTo({ top: 260, behavior: 'smooth' })
}

watch(() => route.params.slug, () => {
  if (categories.value.length) syncFromRoute()
})

onMounted(async () => {
  const [cats, tagList] = await Promise.all([
    siteApi.categories().catch(() => [] as Category[]),
    siteApi.tags().catch(() => [] as Tag[])
  ])
  categories.value = cats
  tags.value = tagList
  // 支持从搜索结果带标签进入：/category?tag=slug
  const tagSlug = String(route.query.tag || '')
  if (tagSlug) {
    const hit = tagList.find((t) => t.slug === tagSlug)
    if (hit) selectedTags.value = [hit.id]
  }
  syncFromRoute()
})
</script>

<template>
  <div class="shell pt-10">
    <!-- 头部 -->
    <div class="relative overflow-hidden rounded-[24px] border border-line bg-soft/50 px-6 py-9 md:px-9">
      <div class="aurora -right-16 -top-20 h-64 w-64" style="background: radial-gradient(circle, rgba(91,108,255,.35), transparent 65%)"></div>
      <div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold">
            <span class="h-px w-6 bg-gold-400/60"></span>Music Library
          </p>
          <h1 class="mt-3 font-display text-[34px] leading-tight md:text-[42px]">{{ title }}</h1>
          <p class="mt-3 max-w-2xl text-[13px] leading-relaxed text-soft">{{ description }}</p>
          <p v-if="currentCategory" class="mt-4 flex flex-wrap gap-2 text-[11px] text-soft/70">
            <span class="chip">{{ currentCategory.icon }} {{ currentCategory.name }}</span>
            <span class="chip">{{ currentCategory.playlistCount || 0 }} 个歌单</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-[11px] text-soft">排序</label>
          <select v-model="sort" class="field !w-auto !py-2 text-[12px]" @change="changeSort">
            <option value="default">编辑推荐</option>
            <option value="hot">最热</option>
            <option value="new">最新收录</option>
            <option value="click">跳转最多</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="mt-6 space-y-4 rounded-2xl border border-line bg-white/[0.02] p-5">
      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 text-[11px] text-soft">维度</span>
        <button
          v-for="t in typeTabs"
          :key="t.key"
          class="rounded-full px-3.5 py-1.5 text-[12px] transition"
          :class="type === t.key ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-glow' : 'border border-line text-soft hover:text-main'"
          @click="switchType(t.key)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 text-[11px] text-soft">分类</span>
        <button class="chip" :class="{ 'chip-active': !selectedSlug }" @click="selectCategory('')">全部</button>
        <button
          v-for="c in typeCategories"
          :key="c.id"
          class="chip"
          :class="{ 'chip-active': selectedSlug === c.slug }"
          @click="selectCategory(c.slug)"
        >
          {{ c.icon }} {{ c.name }}
          <span class="text-[10px] opacity-60">{{ c.playlistCount }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 text-[11px] text-soft">标签<span class="ml-1 opacity-60">多选</span></span>
        <button
          v-for="t in tags"
          :key="t.id"
          class="chip"
          :class="{ 'chip-active': selectedTags.includes(t.id) }"
          @click="toggleTag(t.id)"
        >
          {{ t.name }}
        </button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="mt-8">
      <div class="mb-5 flex items-center justify-between text-[12px] text-soft">
        <span>共 <span class="text-main">{{ data?.total || 0 }}</span> 个歌单</span>
        <button v-if="selectedTags.length" class="text-[11px] text-soft/70 transition hover:text-gold" @click="selectedTags = []; page = 1; load()">
          清空标签筛选 ×
        </button>
      </div>

      <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-72 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
      </div>

      <div v-else-if="data?.list.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PlaylistCard v-for="p in data.list" :key="p.id" :playlist="p" />
      </div>

      <EmptyState v-else title="没有符合条件的歌单" desc="试试减少标签，或切换到其他分类维度。" />

      <!-- 分页 -->
      <div v-if="data && data.totalPages > 1" class="mt-10 flex items-center justify-center gap-2">
        <button class="btn-icon h-9 w-9" :disabled="!canPrev" :class="{ 'opacity-30': !canPrev }" @click="goPage(page - 1)">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
        </button>
        <button
          v-for="n in pageNumbers"
          :key="n"
          class="h-9 min-w-9 rounded-full border px-3 text-[12px] transition"
          :class="n === page ? 'border-gold-400/50 bg-gold-400/10 text-gold' : 'border-line text-soft hover:text-main'"
          @click="goPage(n)"
        >
          {{ n }}
        </button>
        <button class="btn-icon h-9 w-9" :disabled="!canNext" :class="{ 'opacity-30': !canNext }" @click="goPage(page + 1)">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>

    <!-- 合规提示 -->
    <div class="mt-14 rounded-xl border border-line bg-white/[0.02] px-5 py-4 text-[11px] leading-relaxed text-soft/80">
      本站歌单为人工整理的音乐导航信息，不存储、不播放任何音频；点击歌单中的「去收听」将跳转至正版音乐平台官方页面。
    </div>
  </div>
</template>
