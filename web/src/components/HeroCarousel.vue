<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Banner } from '@/types'

const props = defineProps<{ banners: Banner[] }>()

const active = ref(0)
const paused = ref(false)
let timer: number | undefined

const current = computed(() => props.banners[active.value] || null)

function toLink(b: Banner | null) {
  if (!b || b.linkType === 'none' || !b.linkValue) return null
  if (b.linkType === 'playlist') return `/playlist/${b.linkValue}`
  if (b.linkType === 'artist') return `/artist/${b.linkValue}`
  return `/category/${b.linkValue}`
}

const accent = computed(() => {
  const theme = current.value?.theme
  if (theme === 'gold') return '232,197,107'
  if (theme === 'violet') return '139,92,246'
  return '91,108,255'
})

function next() {
  if (!props.banners.length) return
  active.value = (active.value + 1) % props.banners.length
}

function start() {
  stop()
  if (!props.banners.length) return
  timer = window.setInterval(() => {
    if (!paused.value) next()
  }, 6200)
}

function stop() {
  if (timer) window.clearInterval(timer)
  timer = undefined
}

watch(() => props.banners.length, start)

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <section
    v-if="banners.length"
    class="relative"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <div class="relative h-[560px] overflow-hidden rounded-[28px] border border-line-strong bg-soft shadow-[0_40px_120px_-60px_rgba(0,0,0,.9)] md:h-[600px]">
      <!-- 背景图层 -->
      <div
        v-for="(b, i) in banners"
        :key="b.id"
        class="absolute inset-0 transition-opacity duration-[1100ms] ease-out"
        :class="i === active ? 'opacity-100' : 'opacity-0'"
      >
        <img :src="b.image" :alt="b.title" class="absolute inset-0 h-full w-full object-cover" :class="i === active ? 'scale-100' : 'scale-105'" style="transition: transform 7s linear" />
      </div>

      <!-- 可读性遮罩 -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#05060d] via-[#05060d]/80 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#05060d] via-transparent to-[#05060d]/40"></div>
      <div
        class="absolute inset-0 opacity-60"
        :style="{ background: `radial-gradient(ellipse at 72% 30%, rgba(${accent},.35), transparent 58%)` }"
      ></div>

      <!-- 装饰：巨型首字 + 波形 -->
      <div class="pointer-events-none absolute right-[6%] top-[24%] hidden select-none lg:block">
        <span class="font-display text-[190px] leading-none text-white/[0.06]">{{ current?.title?.slice(0, 1) }}</span>
      </div>
      <div class="absolute bottom-8 right-8 hidden items-end gap-[3px] opacity-50 md:flex">
        <span v-for="i in 22" :key="i" class="wave-bar" :style="{ height: `${16 + (i % 7) * 5}px`, animationDelay: `${i * 0.07}s` }"></span>
      </div>

      <!-- 文案区 -->
      <div class="absolute inset-0 flex items-center">
        <div class="shell w-full">
          <div :key="active" class="max-w-2xl page-enter">
            <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] tracking-[0.16em] text-white/75 backdrop-blur-md">
              <span class="h-1.5 w-1.5 rounded-full bg-gold-400"></span>
              {{ current?.badge || '声屿 · 人工策展' }}
            </p>

            <h1 class="font-display text-[44px] leading-[1.08] tracking-[0.06em] text-white sm:text-[58px] md:text-[68px]">
              {{ current?.title }}
            </h1>

            <p class="mt-5 max-w-xl text-[14px] leading-relaxed text-white/65 md:text-[15px]">
              {{ current?.subtitle }}
            </p>

            <div class="mt-9 flex flex-wrap items-center gap-3">
              <RouterLink v-if="toLink(current)" :to="toLink(current)!" class="btn-gold">
                进入专题
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </RouterLink>
              <RouterLink to="/category" class="btn-ghost !border-white/20 !text-white/85 backdrop-blur-md">
                浏览全部歌单
              </RouterLink>
            </div>

            <div class="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-[11px] tracking-wide text-white/45">
              <span class="flex items-center gap-1.5"><span class="h-1 w-1 rounded-full bg-gold-400"></span>全部人工策展</span>
              <span class="flex items-center gap-1.5"><span class="h-1 w-1 rounded-full bg-gold-400"></span>点击直达正版平台</span>
              <span class="flex items-center gap-1.5"><span class="h-1 w-1 rounded-full bg-gold-400"></span>站内零音频</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 轮播控制 -->
      <div class="absolute bottom-6 left-0 right-0">
        <div class="shell flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <button
              v-for="(b, i) in banners"
              :key="b.id"
              class="group flex items-center gap-2"
              :aria-label="`切换到 ${b.title}`"
              @click="active = i"
            >
              <span class="relative h-[2px] overflow-hidden rounded-full bg-white/20 transition-all" :class="i === active ? 'w-10' : 'w-5'">
                <span class="absolute inset-0" :class="i === active ? 'bg-gold-400' : 'bg-white/40'"></span>
              </span>
              <span class="hidden text-[10px] tracking-[0.2em] transition sm:block" :class="i === active ? 'text-white/80' : 'text-white/35 group-hover:text-white/60'">
                {{ String(i + 1).padStart(2, '0') }}
              </span>
            </button>
          </div>

          <p class="hidden text-[10px] tracking-[0.3em] text-white/30 md:block">SCROLL TO DISCOVER</p>

          <button class="flex items-center gap-2 text-[11px] text-white/60 transition hover:text-white" @click="next">
            下一个
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
