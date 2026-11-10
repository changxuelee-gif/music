<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteStore } from '@/stores/site'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const site = useSiteStore()

const type = computed(() => (route.meta.legal as string) || 'privacy')
const isPrivacy = computed(() => type.value === 'privacy')

useSeo({ title: isPrivacy.value ? '隐私政策' : '免责声明' })

onMounted(() => site.load())

const paragraphs = computed(() => {
  const text = isPrivacy.value ? site.config?.privacyPolicy : site.config?.disclaimer
  return String(text || '').split('\n').filter(Boolean)
})
</script>

<template>
  <div class="shell pt-12">
    <div class="mx-auto max-w-3xl">
      <p class="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold">
        <span class="h-px w-6 bg-gold-400/60"></span>{{ isPrivacy ? 'Privacy Policy' : 'Disclaimer' }}
      </p>
      <h1 class="mt-4 font-display text-[34px] md:text-[42px]">{{ isPrivacy ? '隐私政策' : '免责声明' }}</h1>
      <p class="mt-3 text-[12px] text-soft">最近更新：2026 年 11 月 · 适用主体：{{ site.config?.companyName || '凤凰爱听（北京）信息技术有限公司' }}</p>

      <div class="mt-8 space-y-5 rounded-2xl border border-line bg-white/[0.02] p-6 md:p-9">
        <p v-for="(p, i) in paragraphs" :key="i" class="text-[13px] leading-[1.9] text-soft">{{ p }}</p>

        <template v-if="isPrivacy">
          <h2 class="pt-3 font-display text-[18px] text-main">我们收集哪些信息</h2>
          <ul class="space-y-2 text-[13px] leading-relaxed text-soft">
            <li>· 匿名访问日志：IP、浏览器标识、访问路径、来源页面，用于安全防护与流量统计。</li>
            <li>· 账号信息：用户名、昵称与加密后的密码（bcrypt 哈希，不保存明文）。</li>
            <li>· 收藏记录：你主动收藏的歌单与音乐人 ID。</li>
            <li>· 投诉材料：投诉人姓名、联系方式、投诉说明与权属证明文件，仅用于处理投诉。</li>
          </ul>

          <h2 class="pt-3 font-display text-[18px] text-main">我们不会做什么</h2>
          <ul class="space-y-2 text-[13px] leading-relaxed text-soft">
            <li>· 不收集你的通讯录、位置、相册或任何设备内文件。</li>
            <li>· 不向第三方出售、出租或以营销目的共享个人信息。</li>
            <li>· 不在本站内提供音频播放、下载、歌词或音源解析能力。</li>
          </ul>
        </template>

        <template v-else>
          <h2 class="pt-3 font-display text-[18px] text-main">关于站内内容</h2>
          <p class="text-[13px] leading-[1.9] text-soft">
            站内展示的歌单封面、歌曲名、歌手名与平台标识，仅用于音乐导航与信息索引；相关版权归原权利人所有。
            本站不存储任何音频、歌词或音源文件，点击「去收听」将离开本站，跳转至正版音乐平台的官方页面。
          </p>
          <h2 class="pt-3 font-display text-[18px] text-main">关于第三方平台</h2>
          <p class="text-[13px] leading-[1.9] text-soft">
            跳转后的第三方平台服务由其运营方提供并承担相应责任，其内容、收费、会员权益与隐私政策不适用本声明。
            请在使用前阅读对应平台的用户协议。
          </p>
        </template>

        <div class="mt-4 rounded-xl border border-line bg-white/[0.02] p-4 text-[12px] leading-relaxed text-soft">
          如对本政策或站内内容有异议，请联系：<a :href="`mailto:${site.config?.complaintEmail || 'copyright.com'}`" class="text-gold">{{ site.config?.complaintEmail || 'copyright.com' }}</a>
          ，或通过 <RouterLink to="/complaint" class="text-gold">版权投诉入口</RouterLink> 提交工单。
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-soft/70">
        <RouterLink :to="isPrivacy ? '/disclaimer' : '/privacy'" class="transition hover:text-gold">
          查看{{ isPrivacy ? '免责声明' : '隐私政策' }} →
        </RouterLink>
        <RouterLink to="/complaint" class="transition hover:text-gold">版权投诉入口 →</RouterLink>
        <span>{{ site.config?.icpNo }} · {{ site.config?.wenwangwenNo }}</span>
      </div>
    </div>
  </div>
</template>
