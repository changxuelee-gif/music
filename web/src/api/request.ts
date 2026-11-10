import axios from 'axios'
import { mockRequest } from '@/mock'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

http.interceptors.request.use((config) => {
  const url = config.url || ''
  const isAdmin = url.startsWith('/admin')
  const token = localStorage.getItem(isAdmin ? 'fh_admin_token' : 'fh_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface RequestOptions {
  params?: Record<string, any>
  data?: Record<string, any> | FormData
}

/** 统一请求：解包 { code, message, data }，失败抛出可读错误 */
export async function request<T>(method: string, url: string, options: RequestOptions = {}): Promise<T> {
  if (USE_MOCK) {
    await delay(180)
    // 演示模式下数据在内存中即时返回
    return mockRequest(method, url, options.params || {}, (options.data as Record<string, any>) || {}) as T
  }

  try {
    const res = await http.request({ method, url, params: options.params, data: options.data })
    const payload = res.data
    if (payload && typeof payload.code !== 'undefined' && payload.code !== 0) {
      throw new Error(payload.message || '请求失败')
    }
    return (payload.data ?? payload) as T
  } catch (err: any) {
    if (err?.response?.status === 401) {
      // 登录态失效：清空对应 token
      const isAdmin = url.startsWith('/admin')
      localStorage.removeItem(isAdmin ? 'fh_admin_token' : 'fh_token')
    }
    const message = err?.response?.data?.message || err?.message || '网络异常，请稍后再试'
    throw new Error(message)
  }
}
