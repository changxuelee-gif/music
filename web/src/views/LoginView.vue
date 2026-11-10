<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSeo } from '@/composables/useSeo'
import { USE_MOCK } from '@/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const nickname = ref('')
const error = ref('')
const submitting = ref(false)

useSeo({ title: mode.value === 'login' ? '登录' : '注册' })

const title = computed(() => (mode.value === 'login' ? '欢迎回来' : '创建账号'))

async function submit() {
  error.value = ''
  if (username.value.trim().length < 4) return (error.value = '用户名至少 4 位')
  if (password.value.length < 8) return (error.value = '密码至少 8 位')

  submitting.value = true
  try {
    if (mode.value === 'login') await auth.login(username.value.trim(), password.value)
    else await auth.register(username.value.trim(), password.value, nickname.value.trim() || undefined)

    const redirect = String(route.query.redirect || '/favorites')
    router.push(redirect)
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}

function switchMode(m: 'login' | 'register') {
  mode.value = m
  error.value = ''
}
</script>

<template>
  <div class="shell pt-12">
    <div class="mx-auto grid max-w-4xl overflow-hidden rounded-[26px] border border-line bg-soft/50 lg:grid-cols-[1fr_1.05fr]">
      <!-- 左侧品牌 -->
      <div class="relative hidden flex-col justify-between overflow-hidden p-9 lg:flex">
        <div class="absolute inset-0 opacity-70" style="background: radial-gradient(ellipse at 20% 20%, rgba(91,108,255,.45), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(124,92,255,.35), transparent 60%)"></div>
        <div class="relative">
          <p class="text-[11px] uppercase tracking-[0.3em] text-gold">SoundIsle Music</p>
          <h1 class="mt-4 font-display text-[34px] leading-tight">让每一次点击<br />都抵达正版</h1>
          <p class="mt-4 max-w-xs text-[13px] leading-relaxed text-soft">
            登录后可收藏歌单与音乐人，建立属于你的私人听觉地图。本站不提供播放，只负责把你送去正版平台。
          </p>
        </div>
        <div class="relative">
          <div class="flex items-end gap-[3px] opacity-60">
            <span v-for="i in 24" :key="i" class="wave-bar" :style="{ height: `${10 + (i % 7) * 5}px`, animationDelay: `${i * 0.08}s` }"></span>
          </div>
          <p class="mt-4 text-[10px] tracking-[0.2em] text-soft/60">NO AUDIO · NO PLAYER · JUST DISCOVERY</p>
        </div>
      </div>

      <!-- 右侧表单 -->
      <div class="bg-white/[0.02] p-7 md:p-9">
        <div class="flex items-center gap-1 rounded-full border border-line p-1">
          <button
            class="flex-1 rounded-full py-2 text-[12px] transition"
            :class="mode === 'login' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-soft'"
            @click="switchMode('login')"
          >登录</button>
          <button
            class="flex-1 rounded-full py-2 text-[12px] transition"
            :class="mode === 'register' ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-soft'"
            @click="switchMode('register')"
          >注册</button>
        </div>

        <h2 class="mt-7 font-display text-[24px]">{{ title }}</h2>
        <p class="mt-1.5 text-[12px] text-soft">游客可直接浏览全部歌单，登录仅用于收藏同步。</p>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">用户名</label>
            <input v-model="username" class="field" autocomplete="username" placeholder="4-20 位字母、数字或下划线" />
          </div>
          <div v-if="mode === 'register'">
            <label class="mb-1.5 block text-[12px] text-soft">昵称（选填）</label>
            <input v-model="nickname" class="field" maxlength="20" placeholder="展示名称" />
          </div>
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">密码</label>
            <input v-model="password" type="password" class="field" autocomplete="current-password" placeholder="至少 8 位" />
          </div>

          <p v-if="error" class="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{{ error }}</p>

          <button class="btn-primary w-full" :disabled="submitting">
            {{ submitting ? '处理中…' : mode === 'login' ? '登录' : '注册并登录' }}
          </button>
        </form>

        <p v-if="USE_MOCK" class="mt-4 rounded-lg border border-gold-400/25 bg-gold-400/5 px-3 py-2 text-[11px] leading-relaxed text-gold/90">
          演示模式：任意用户名 + 8 位以上密码即可登录，收藏数据保存在本地浏览器。
        </p>

        <div class="mt-6 flex items-center justify-between text-[11px] text-soft/70">
          <RouterLink to="/privacy" class="transition hover:text-gold">隐私政策</RouterLink>
          <RouterLink to="/admin/login" class="transition hover:text-gold">管理后台入口 →</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
