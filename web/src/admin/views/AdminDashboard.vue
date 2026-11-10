<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/api'
import { platformLabel, platformColor } from '@/utils/track'

const data = ref<any>(null)
const loading = ref(true)
const error = ref('')

const maxPv = computed(() => Math.max(1, ...(data.value?.trend || []).map((t: any) => t.pv)))
const platformTotal = computed(() => (data.value?.platformDistribution || []).reduce((n: number, p: any) => n + p.count, 0))

const kpis = computed(() => {
  if (!data.value) return []
  const t = data.value.totals
  const diff = data.value.today.pv - data.value.yesterday.pv
  const diffRate = data.value.yesterday.pv ? Math.round((diff / data.value.yesterday.pv) * 100) : 0
  return [
    { label: '今日访问量 PV', value: data.value.today.pv, sub: `${diffRate >= 0 ? '+' : ''}${diffRate}% 较昨日`, up: diffRate >= 0, accent: 'indigo' },
    { label: '今日独立访客 UV', value: data.value.today.uv, sub: `昨日 ${data.value.yesterday.uv}`, accent: 'violet' },
    { label: '收录歌单 / 歌曲', value: `${t.playlists} / ${t.songs}`, sub: `音乐人 ${t.artists} 位`, accent: 'gold' },
    { label: '待处理投诉', value: t.pendingComplaints, sub: `累计工单 ${t.complaints} 条`, accent: t.pendingComplaints ? 'red' : 'green' }
  ]
})

function fmt(n: number) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(async () => {
  try {
    data.value = await adminApi.dashboard()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="grid gap-4 md:grid-cols-4">
      <div v-for="i in 4" :key="i" class="h-28 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>
    </div>

    <div v-else-if="error" class="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[12px] text-red-300">{{ error }}</div>

    <template v-else-if="data">
      <!-- KPI -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="k in kpis" :key="k.label" class="glass-card relative overflow-hidden p-5">
          <div class="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-20 blur-2xl" :style="{ background: k.accent === 'gold' ? '#E8C56B' : k.accent === 'violet' ? '#7C5CFF' : k.accent === 'red' ? '#F87171' : '#5B6CFF' }"></div>
          <p class="text-[11px] tracking-wide text-soft">{{ k.label }}</p>
          <p class="mt-2 font-display text-[28px] leading-none">{{ k.value }}</p>
          <p class="mt-2 text-[10px]" :class="k.up === false ? 'text-red-300' : 'text-soft/70'">{{ k.sub }}</p>
        </div>
      </div>

      <div class="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <!-- 趋势 -->
        <div class="glass-card p-5 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display text-[18px]">近 7 日访问趋势</h2>
              <p class="mt-1 text-[10px] text-soft">PV / UV 来自站内访问埋点，不含后台访问</p>
            </div>
            <div class="flex items-center gap-3 text-[10px] text-soft">
              <span class="flex items-center gap-1"><i class="h-2 w-2 rounded-full bg-indigo-400"></i>PV</span>
              <span class="flex items-center gap-1"><i class="h-2 w-2 rounded-full bg-gold-400"></i>UV</span>
            </div>
          </div>

          <div class="mt-7 flex h-48 items-end gap-2 md:gap-4">
            <div v-for="t in data.trend" :key="t.date" class="group flex flex-1 flex-col items-center gap-2">
              <div class="relative flex w-full items-end justify-center gap-1" :style="{ height: '160px' }">
                <div class="w-1/2 max-w-[18px] rounded-t-md bg-gradient-to-t from-indigo-500/40 to-indigo-400 transition-all group-hover:from-indigo-500/60" :style="{ height: `${(t.pv / maxPv) * 100}%` }"></div>
                <div class="w-1/3 max-w-[12px] rounded-t-md bg-gradient-to-t from-gold-400/30 to-gold-400 transition-all" :style="{ height: `${(t.uv / maxPv) * 100}%` }"></div>
                <span class="pointer-events-none absolute -top-7 whitespace-nowrap rounded-md border border-line bg-elevated px-2 py-1 text-[10px] opacity-0 transition group-hover:opacity-100">
                  PV {{ fmt(t.pv) }} · UV {{ fmt(t.uv) }}
                </span>
              </div>
              <span class="text-[10px] text-soft/70">{{ t.date }}</span>
            </div>
          </div>
        </div>

        <!-- 平台分布 -->
        <div class="glass-card p-5 md:p-6">
          <h2 class="font-display text-[18px]">跳转平台分布</h2>
          <p class="mt-1 text-[10px] text-soft">按歌曲条目统计，全部为白名单内正版平台</p>
          <div class="mt-6 space-y-4">
            <div v-for="p in data.platformDistribution" :key="p.platform">
              <div class="mb-1.5 flex items-center justify-between text-[11px]">
                <span class="flex items-center gap-2">
                  <i class="h-2 w-2 rounded-full" :style="{ background: platformColor(p.platform) }"></i>
                  {{ platformLabel(p.platform) }}
                </span>
                <span class="text-soft">{{ p.count }}</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div class="h-full rounded-full" :style="{ width: `${platformTotal ? (p.count / platformTotal) * 100 : 0}%`, background: platformColor(p.platform) }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <!-- 热门歌单 -->
        <div class="glass-card overflow-hidden">
          <div class="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 class="font-display text-[17px]">热门歌单（按跳转量）</h2>
            <RouterLink to="/admin/playlists" class="text-[11px] text-soft transition hover:text-gold">全部歌单 →</RouterLink>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[520px] text-left">
              <thead>
                <tr class="border-b border-line text-[10px] uppercase tracking-wide text-soft/60">
                  <th class="px-5 py-2.5 font-normal">歌单</th>
                  <th class="px-3 py-2.5 font-normal">曲目</th>
                  <th class="px-3 py-2.5 font-normal">浏览</th>
                  <th class="px-3 py-2.5 font-normal">跳转</th>
                  <th class="px-5 py-2.5 font-normal">收藏</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in data.topPlaylists" :key="p.id" class="border-b border-line/60 last:border-b-0 hover:bg-white/[0.03]">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <img :src="p.cover" class="h-9 w-9 rounded-lg object-cover" />
                      <RouterLink :to="`/playlist/${p.slug}`" target="_blank" class="line-clamp-1 text-[12px] hover:text-gold">{{ p.title }}</RouterLink>
                    </div>
                  </td>
                  <td class="px-3 py-3 text-[11px] text-soft">{{ p.songCount }}</td>
                  <td class="px-3 py-3 text-[11px] text-soft">{{ fmt(p.viewCount) }}</td>
                  <td class="px-3 py-3 text-[11px] text-gold">{{ fmt(p.clickCount) }}</td>
                  <td class="px-5 py-3 text-[11px] text-soft">{{ p.favoriteCount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-5">
          <!-- 热门搜索 -->
          <div class="glass-card p-5">
            <h2 class="font-display text-[17px]">热门搜索词</h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="(h, i) in data.hotKeywords" :key="h.word" class="rounded-full border border-line px-3 py-1.5 text-[11px]" :class="i < 3 ? 'border-gold-400/40 text-gold' : 'text-soft'">
                {{ h.word }} <span class="ml-1 text-[10px] opacity-60">{{ h.count }}</span>
              </span>
            </div>
          </div>

          <!-- 最新投诉 -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between">
              <h2 class="font-display text-[17px]">最新投诉工单</h2>
              <RouterLink to="/admin/complaints" class="text-[11px] text-soft transition hover:text-gold">处理 →</RouterLink>
            </div>
            <div class="mt-3 divide-y divide-line/60">
              <RouterLink v-for="c in data.recentComplaints" :key="c.id" to="/admin/complaints" class="flex items-center justify-between py-2.5 text-[11px]">
                <div class="min-w-0">
                  <p class="truncate text-soft">{{ c.name }} · {{ c.type }}</p>
                  <p class="mt-0.5 text-[10px] text-soft/50">{{ c.ticketNo }} · {{ c.createdAt }}</p>
                </div>
                <span class="shrink-0 rounded-full px-2 py-0.5 text-[9px]" :class="c.status === 'pending' ? 'bg-red-500/15 text-red-300' : 'bg-white/5 text-soft'">
                  {{ c.status === 'pending' ? '待处理' : c.status === 'done' ? '已完成' : '处理中' }}
                </span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white/[0.02] px-5 py-3 text-[10px] text-soft/70">
        <span>合规状态：站内音频 0 · 播放器 0 · 第三方抓取 0</span>
        <span>外链白名单：y.qq.com / music.163.com / kugou.com / qishui.douyin.com 等</span>
      </div>
    </template>
  </div>
</template>
