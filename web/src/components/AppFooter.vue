<script setup lang="ts">
/**
 * 页脚：合规资质固定展示区
 * 公司主体、文网文、ICP、版权投诉入口、隐私政策、免责声明
 */
import { computed, onMounted, ref } from 'vue'
import { useSiteStore } from '@/stores/site'
import axios from 'axios'

const site = useSiteStore()
onMounted(() => site.load())

const overview = ref({ todayPv: 0, todayUv: 0, totalPv: 0, totalUv: 0 })
onMounted(async () => {
  try {
    const { data } = await axios.get('/api/stats/overview')
    if (data.code === 0) overview.value = data.data
  } catch (e) { /* 静默 */ }
})

const cfg = computed(() => site.config || {
  siteName: '声屿音乐导航',
  slogan: '发现好音乐，直达正版音乐平台',
  companyName: '凤凰爱听（北京）信息技术有限公司',
  icpNo: '京B2-20213133',
  wenwangwenNo: '京网文〔2023〕3019-099号',
  complaintEmail: 'copyright.com',
  complaintPhone: '010-8888 6666',
  disclaimer: '本站仅提供正版音乐平台官方页面的跳转服务，不存储、不播放、不提供任何音频、歌词或音源文件。',
  hotSearchWords: []
})

const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative z-10 mt-24 border-t border-line bg-soft/60 backdrop-blur-xl">
    <div class="shell py-14">
      <div class="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <!-- 品牌 -->
        <div>
          <div class="flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-xl border border-line-strong bg-white/[0.06]">
              <svg viewBox="0 0 32 32" class="h-5 w-5">
                <path d="M6 22V10c0-.8.7-1.5 1.5-1.5H22" stroke="#8C9BFF" stroke-width="2" fill="none" stroke-linecap="round" />
                <path d="M9 26c2.2-6 5.2-8.5 7.5-8.5s4.3 2.8 6.5 8.5" stroke="#E8C56B" stroke-width="1.8" fill="none" stroke-linecap="round" />
                <circle cx="17" cy="12.5" r="2.5" fill="#E8C56B" />
              </svg>
            </span>
            <div>
              <p class="font-display text-lg tracking-[0.1em]">{{ cfg.siteName }}</p>
              <p class="text-[11px] tracking-[0.18em] text-soft">FENGHUANG MUSIC NAVIGATOR</p>
            </div>
          </div>
          <p class="mt-4 max-w-xs text-[13px] leading-relaxed text-soft">
            {{ cfg.slogan }}。所有歌单由编辑人工整理，点击即跳转正版平台官方页面。
          </p>
          <div class="mt-5 flex items-center gap-2">
            <span class="chip">🙅 不存储音频</span>
            <span class="chip">🚫 不提供播放</span>
            <span class="chip">✅ 正版直达</span>
          </div>
        </div>

        <!-- 发现 -->
        <div>
          <p class="text-[11px] uppercase tracking-[0.24em] text-soft">Discover</p>
          <p class="mt-3 font-display text-base">发现音乐</p>
          <ul class="mt-4 space-y-2.5 text-[13px] text-soft">
            <li><RouterLink to="/category" class="transition hover:text-gold">风格分类</RouterLink></li>
            <li><RouterLink to="/artists" class="transition hover:text-gold">音乐人导航</RouterLink></li>
            <li><RouterLink to="/search" class="transition hover:text-gold">全站搜索</RouterLink></li>
            <li><RouterLink to="/favorites" class="transition hover:text-gold">我的收藏</RouterLink></li>
          </ul>
        </div>

        <!-- 合规 -->
        <div>
          <p class="text-[11px] uppercase tracking-[0.24em] text-soft">Compliance</p>
          <p class="mt-3 font-display text-base">合规与权利</p>
          <ul class="mt-4 space-y-2.5 text-[13px] text-soft">
            <li><RouterLink to="/complaint" class="transition hover:text-gold">版权投诉入口</RouterLink></li>
            <li><RouterLink to="/privacy" class="transition hover:text-gold">隐私政策</RouterLink></li>
            <li><RouterLink to="/disclaimer" class="transition hover:text-gold">免责声明</RouterLink></li>
            <li><a :href="`mailto:${cfg.complaintEmail}`" class="transition hover:text-gold">{{ cfg.complaintEmail }}</a></li>
          </ul>
        </div>

        <!-- 资质 -->
        <div>
          <p class="text-[11px] uppercase tracking-[0.24em] text-soft">License</p>
          <p class="mt-3 font-display text-base">运营资质</p>
          <div class="mt-4 space-y-3 text-[12px] leading-relaxed text-soft">
            <p>{{ cfg.companyName }}</p>
            <p>网络文化经营许可证：<span class="text-main">{{ cfg.wenwangwenNo }}</span></p>
            <p>ICP 备案号：<span class="text-main">{{ cfg.icpNo }}</span></p>
            <p>投诉电话：<span class="text-main">{{ cfg.complaintPhone }}</span></p>
            <RouterLink to="/admin/login" class="inline-block text-[11px] text-soft/60 transition hover:text-soft">管理后台 →</RouterLink>
          </div>
        </div>
      </div>

      <div class="mt-12 rounded-2xl border border-line bg-white/[0.02] p-5 text-[12px] leading-relaxed text-soft">
        <p><span class="text-gold">免责声明：</span>{{ cfg.disclaimer }}</p>
        <p class="mt-2 text-soft/70">
          本站为音乐导航站，不提供任何音频、歌词、音源存储与播放服务；站内所有跳转均指向正版音乐平台官方页面，版权归原权利人所有。
        </p>
      </div>

      <div class="mt-8 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[11px] text-soft/70 md:flex-row md:items-center">
        <p>© {{ year }} {{ cfg.companyName }} 版权所有</p>
        <div class="flex flex-col gap-2 md:items-end">
          <p class="flex flex-wrap items-center gap-3">
            <span>声屿 · 精品人工音乐导航</span>
            <span class="hidden h-3 w-px bg-white/15 md:block"></span>
            <span>{{ cfg.icpNo }}</span>
            <span class="hidden h-3 w-px bg-white/15 md:block"></span>
            <span>{{ cfg.wenwangwenNo }}</span>
          </p>
          <p class="flex items-center gap-2 text-soft/60">
            <span class="flex items-center gap-1">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18" stroke-linecap="round"/><path d="M7 14l4-4 4 3 5-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              今日 <span class="text-gold">{{ overview.todayPv }}</span> PV / <span class="text-gold">{{ overview.todayUv }}</span> UV
            </span>
            <span class="h-3 w-px bg-white/15"></span>
            <span>累计 <span class="text-gold">{{ overview.totalPv }}</span> PV / <span class="text-gold">{{ overview.totalUv }}</span> UV</span>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
