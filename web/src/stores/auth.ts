import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/types'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('fh_token') || '')
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value))

  function persist(t: string, u: AuthUser | null) {
    token.value = t
    user.value = u
    if (t) localStorage.setItem('fh_token', t)
    else localStorage.removeItem('fh_token')
  }

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login({ username, password })
      persist(res.token, res.user)
      return res.user
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, password: string, nickname?: string) {
    loading.value = true
    try {
      const res = await authApi.register({ username, password, nickname })
      persist(res.token, res.user)
      return res.user
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      user.value = await authApi.me()
    } catch {
      logout()
    }
  }

  function logout() {
    persist('', null)
  }

  return { token, user, loading, isLoggedIn, login, register, fetchMe, logout }
})
