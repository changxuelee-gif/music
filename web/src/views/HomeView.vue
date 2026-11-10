<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { siteApi } from '@/api'
import type { HomeData } from '@/types'
import { useSeo } from '@/composables/useSeo'
import HeroCarousel from '@/components/HeroCarousel.vue'
import SectionTitle from '@/components/SectionTitle.vue'
import PlaylistCard from '@/components/PlaylistCard.vue'
import ArtistCard from '@/components/ArtistCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const home = ref<HomeData | null>(null)
const loading = ref(true)
const error = ref('')

useSeo({
  title: '发现好音乐，直达正版音乐平台',
  description: '声屿音乐导航：按风格、场景、音乐人组织的精品人工歌单，点击直达 QQ音乐、网易云音乐等正版平台。'
})

onMounted(async () => {
  try {
    home.value = await siteApi.home()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const stats = computed(() => {
  if (!home.value) return []
  const unique = new Map<number, any>()
  ;[...home.value.featured, ...home.value.hot, ...home.value.latest].forEach((p) => unique.set(p.id, p))
  return [
    { value: String(unique.size), label: '人工策展歌单' },
    { value: String(home.value.artists.length), label: '热门音乐人' },
    { value: '6', label: '正版平台直达' },
    { value: '0', label: '站内音频' }
  ]
})
</script>

<template>
  <div class="pb-10">
    <!-- Hero -->
    <section class="shell pt-8 md:pt-10">
      <HeroCarousel v-if="home" :banners="home.banners" />
      <div v-else class="h-[560px] animate-pulse rounded-[28px] border border-line bg-white/[0.04]"></div>

      <!-- 数据条 -->
      <div v-if="home" class="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div v-for="s in stats" :key="s.label" class="glass-card flex items-center justify-between px-5 py-4">
          <div>
            <p class="font-display text-[26px] leading-none text-main">{{ s.value }}</p>
            <p class="mt-1.5 text-[11px] tracking-wide text-soft">{{ s.label }}</p>
          </div>
          <span class="h-8 w-8 rounded-full border border-line bg-white/[0.03]"></span>
        </div>
      </div>
    </section>

    <div v-if="error" class="shell mt-10">
      <EmptyState title="数据加载失败" :desc="error" />
    </div>

    <template v-if="home">
      <!-- 精选推荐 -->
      <section class="shell mt-20">
        <SectionTitle
          kicker="Editor's Choice"
          title="精选推荐"
          desc="编辑人工试听、逐条录入的歌单，不做机器抓取，不做自动榜单。"
        >
          <template #action>
            <RouterLink to="/category" class="btn-ghost text-[12px]">查看全部歌单 →</RouterLink>
          </template>
        </SectionTitle>

        <div v-if="home.featured.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <PlaylistCard v-for="p in home.featured" :key="p.id" :playlist="p" />
        </div>
        <EmptyState v-else title="还没有精选歌单" desc="管理员可在后台把歌单标记为「精选推荐」。" />
      </section>

      <!-- 风格分类 -->
      <section class="shell mt-20">
        <SectionTitle kicker="By Genre" title="音乐风格" desc="从国风到爵士，按你此刻想听的质地选择。">
          <template #action>
            <RouterLink to="/category" class="btn-ghost text-[12px]">全部分类 →</RouterLink>
          </template>
        </SectionTitle>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <RouterLink
            v-for="c in home.styles"
            :key="c.id"
            :to="`/category/${c.slug}`"
            class="group glass-card relative overflow-hidden p-5"
          >
            <div class="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" :style="{ background: c.color || '#5b6cff' }"></div>
            <div class="flex items-start justify-between">
              <span class="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white/[0.04] text-[20px]">{{ c.icon }}</span>
              <span class="text-[10px] text-soft/70">{{ c.playlistCount }} 个歌单</span>
            </div>
            <p class="mt-4 font-display text-[18px] transition group-hover:text-gold">{{ c.name }}</p>
            <p class="mt-1 line-clamp-2 text-[11px] leading-relaxed text-soft">{{ c.intro }}</p>
            <span class="mt-3 inline-flex items-center gap-1 text-[11px] text-soft/60 transition group-hover:text-gold">
              进入分类
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </RouterLink>
        </div>
      </section>

      <!-- 场景 BGM -->
      <section class="shell mt-20">
        <div class="glass-card overflow-hidden">
          <div class="grid lg:grid-cols-[0.95fr_1.6fr]">
            <div class="relative border-b border-line p-8 md:p-10 lg:border-b-0 lg:border-r">
              <div class="aurora -left-10 top-10 h-48 w-48" style="background: radial-gradient(circle, rgba(124,92,255,.55), transparent 65%)"></div>
              <p class="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold"><span class="h-px w-6 bg-gold-400/60"></span>Scene BGM</p>
              <h2 class="mt-4 font-display text-[32px] leading-tight">场景 BGM 专区</h2>
              <p class="mt-3 max-w-sm text-[13px] leading-relaxed text-soft">
                通勤、深夜、专注、运动、咖啡馆、影视混剪 —— 按场景整理的人工歌单，让音乐先于情绪抵达。
              </p>
              <div class="mt-7 flex items-end gap-[3px] opacity-60">
                <span v-for="i in 26" :key="i" class="wave-bar" :style="{ height: `${12 + (i % 8) * 5}px`, animationDelay: `${i * 0.06}s` }"></span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-px bg-[color:var(--line)] md:grid-cols-3">
              <RouterLink
                v-for="c in home.scenes"
                :key="c.id"
                :to="`/category/${c.slug}`"
                class="group bg-soft/40 p-5 transition hover:bg-white/[0.06]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[22px]">{{ c.icon }}</span>
                  <span class="text-[10px] text-soft/60">{{ c.playlistCount }} 个歌单</span>
                </div>
                <p class="mt-3 font-display text-[15px] transition group-hover:text-gold">{{ c.name }}</p>
                <p class="mt-1 line-clamp-2 text-[10px] leading-relaxed text-soft/80">{{ c.intro }}</p>
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 音乐人 -->
      <section class="shell mt-20">
        <SectionTitle kicker="Artists" title="音乐人导航" desc="只收录官方主页链接，点击新开标签直达正版平台。">
          <template #action>
            <RouterLink to="/artists" class="btn-ghost text-[12px]">全部音乐人 →</RouterLink>
          </template>
        </SectionTitle>
        <div class="grid gap-4 md:grid-cols-2">
          <ArtistCard v-for="a in home.artists" :key="a.id" :artist="a" />
        </div>
      </section>

      <!-- 热门榜单 -->
      <section class="shell mt-20">
        <div class="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <SectionTitle kicker="Hot Chart" title="热门人工榜单" desc="按「去收听」点击量排序，全部由真实跳转产生。">
            </SectionTitle>
            <div class="glass-card divide-y divide-[color:var(--line)] overflow-hidden px-2">
              <RouterLink
                v-for="(p, idx) in home.hot.slice(0, 6)"
                :key="p.id"
                :to="`/playlist/${p.slug}`"
                class="group flex items-center gap-4 px-3 py-4 transition hover:bg-white/[0.04]"
              >
                <span class="w-8 shrink-0 font-display text-[20px]" :class="idx < 3 ? 'text-gold' : 'text-soft/60'">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>
                <div v-if="p.cover" class="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <img :src="p.cover" :alt="p.title" loading="lazy" class="h-full w-full object-cover" />
                </div>
                <div v-else class="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-indigo-900/60 to-purple-900/40"></div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[14px] transition group-hover:text-gold">{{ p.title }}</p>
                  <p class="mt-0.5 truncate text-[11px] text-soft">{{ p.summary }}</p>
                </div>
                <div class="hidden shrink-0 text-right sm:block">
                  <p class="text-[11px] text-soft/70">{{ p.clickCount || 0 }} 次跳转</p>
                  <p class="text-[10px] text-soft/50">{{ p.songCount }} 首</p>
                </div>
                <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-soft/50 transition group-hover:text-gold" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </RouterLink>
            </div>
          </div>

          <div>
            <SectionTitle kicker="Manifesto" title="我们只做发现，不做播放" />
            <div class="glass-card relative overflow-hidden p-7">
              <div class="aurora -right-10 -top-10 h-48 w-48" style="background: radial-gradient(circle, rgba(232,197,107,.3), transparent 65%)"></div>
              <ul class="space-y-5 text-[13px] leading-relaxed text-soft">
                <li class="flex gap-3">
                  <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold-400/30 text-[10px] text-gold">01</span>
                  <p><span class="text-main">不存储、不播放。</span>站内没有任何音频、歌词与播放器，所有动效只是视觉装饰。</p>
                </li>
                <li class="flex gap-3">
                  <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold-400/30 text-[10px] text-gold">02</span>
                  <p><span class="text-main">人工录入，拒绝抓取。</span>没有爬虫、没有定时同步榜单，每条链接都经过编辑核对。</p>
                </li>
                <li class="flex gap-3">
                  <span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold-400/30 text-[10px] text-gold">03</span>
                  <p><span class="text-main">只去正版平台。</span>外链白名单校验，只允许配置 QQ音乐、网易云音乐、酷狗音乐、汽水音乐等官方域名。</p>
                </li>
              </ul>
              <RouterLink to="/complaint" class="btn-ghost mt-7 w-full text-[12px]">版权投诉与权利声明 →</RouterLink>
            </div>
          </div>
        </div>
      </section>

      <!-- 新收录 -->
      <section class="shell mt-20">
        <SectionTitle kicker="New Arrivals" title="新收录" desc="最近上架的人工策展歌单。">
          <template #action>
            <RouterLink to="/search?sort=new" class="btn-ghost text-[12px]">更多新歌单 →</RouterLink>
          </template>
        </SectionTitle>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <PlaylistCard v-for="p in home.latest.slice(0, 4)" :key="p.id" :playlist="p" />
        </div>
      </section>

      <!-- 语种快捷 -->
      <section class="shell mt-20">
        <div class="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-6 py-5">
          <span class="text-[11px] uppercase tracking-[0.24em] text-soft">By Language</span>
          <span class="hidden h-4 w-px bg-white/10 md:block"></span>
          <RouterLink
            v-for="c in home.languages"
            :key="c.id"
            :to="`/category/${c.slug}`"
            class="rounded-full border border-line px-3.5 py-1.5 text-[12px] text-soft transition hover:border-gold-400/40 hover:text-gold"
          >
            {{ c.icon }} {{ c.name }}
          </RouterLink>
          <RouterLink to="/category" class="ml-auto text-[11px] text-soft/60 transition hover:text-gold">查看全部 →</RouterLink>
        </div>
      </section>
    </template>

    <div v-if="loading" class="shell mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="h-64 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>
  </div>
</template>
