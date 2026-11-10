import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types'
import { adminApi } from '@/api'

/** 后台登录态：独立 token，与前台用户互不影响 */
export const useAdminStore = defineStore('admin', () => {
  const token = ref<string>(localStorage.getItem('fh_admin_token') || '')
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await adminApi.login({ username, password })
      token.value = res.token
      user.value = res.user
      localStorage.setItem('fh_admin_token', res.token)
      localStorage.setItem('fh_admin_user', JSON.stringify(res.user))
      return res.user
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await adminApi.me()
      localStorage.setItem('fh_admin_user', JSON.stringify(user.value))
    } catch {
      logout()
    }
  }

  function hydrate() {
    try {
      const cached = localStorage.getItem('fh_admin_user')
      if (cached) user.value = JSON.parse(cached)
    } catch {
      user.value = null
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('fh_admin_token')
    localStorage.removeItem('fh_admin_user')
  }

  return { token, user, loading, isLoggedIn, isAdmin, login, fetchMe, hydrate, logout }
})
