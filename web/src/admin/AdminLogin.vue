<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { USE_MOCK } from '@/api'
import { useSeo } from '@/composables/useSeo'

const route = useRoute()
const router = useRouter()
const admin = useAdminStore()

const username = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

useSeo({ title: '管理后台登录' })

async function submit() {
  error.value = ''
  if (!username.value || !password.value) {
    error.value = '请输入账号和密码'
    return
  }
  submitting.value = true
  try {
    await admin.login(username.value.trim(), password.value)
    router.push(String(route.query.redirect || '/admin'))
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
    <div class="absolute inset-0 bg-base"></div>
    <div class="aurora -left-20 top-0 h-[520px] w-[520px]" style="background: radial-gradient(circle, rgba(91,108,255,.45), transparent 65%)"></div>
    <div class="aurora -right-20 bottom-0 h-[520px] w-[520px]" style="background: radial-gradient(circle, rgba(124,92,255,.35), transparent 65%)"></div>

    <div class="relative w-full max-w-[420px]">
      <div class="mb-7 flex items-center gap-3">
        <span class="grid h-11 w-11 place-items-center rounded-2xl border border-line-strong bg-white/[0.06]">
          <svg viewBox="0 0 32 32" class="h-6 w-6" aria-hidden="true">
            <rect x="7" y="15" width="2.5" height="7" rx="1.25" fill="#fff" opacity=".75" />
            <rect x="11.5" y="11" width="2.5" height="15" rx="1.25" fill="#fff" />
            <rect x="16" y="7" width="2.5" height="22" rx="1.25" fill="#E8C56B" />
            <rect x="20.5" y="13" width="2.5" height="11" rx="1.25" fill="#fff" />
            <rect x="25" y="17" width="2.5" height="5" rx="1.25" fill="#fff" opacity=".75" />
          </svg>
        </span>
        <div>
          <p class="font-display text-[20px] tracking-[0.1em]">声屿</p>
          <p class="text-[10px] uppercase tracking-[0.26em] text-soft">Content Management</p>
        </div>
      </div>

      <div class="glass-card grad-border p-7">
        <h1 class="font-display text-[24px]">管理后台登录</h1>
        <p class="mt-1.5 text-[12px] text-soft">管理员与内容审核员入口，前后台账号体系隔离。</p>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">账号</label>
            <input v-model="username" class="field" autocomplete="username" placeholder="请输入后台账号" />
          </div>
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">密码</label>
            <input v-model="password" type="password" class="field" autocomplete="current-password" placeholder="请输入密码" />
          </div>

          <p v-if="error" class="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{{ error }}</p>

          <button class="btn-primary w-full" :disabled="submitting">{{ submitting ? '登录中…' : '登录后台' }}</button>
        </form>

        <p v-if="USE_MOCK" class="mt-4 rounded-lg border border-gold-400/25 bg-gold-400/5 px-3 py-2 text-[11px] leading-relaxed text-gold/90">
          演示账号：admin / Admin@123456（管理员）；reviewer / Review@123（审核员）
        </p>

        <RouterLink to="/" class="mt-6 flex items-center justify-center gap-1 text-[11px] text-soft transition hover:text-gold">
          ← 返回前台首页
        </RouterLink>
      </div>

      <p class="mt-6 text-center text-[10px] leading-relaxed text-soft/60">
        后台仅用于录入导航元数据，禁止上传任何音频、歌词或音源文件。
      </p>
    </div>
  </div>
</template>
