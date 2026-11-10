<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/api'
import type { Paged } from '@/types'
import { useAdminStore } from '@/stores/admin'
import AdminModal from '@/admin/components/AdminModal.vue'

const admin = useAdminStore()
const data = ref<Paged<any> | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const toast = ref('')
const page = ref(1)
const modalOpen = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  username: '', nickname: '', password: '', role: 'reviewer', status: 1
})

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => Boolean(data.value && page.value < data.value.totalPages))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    data.value = await adminApi.users({ page: page.value, pageSize: 12 })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function open(row?: any) {
  error.value = ''
  editingId.value = row?.id || null
  Object.assign(form, row
    ? { username: row.username, nickname: row.nickname || '', password: '', role: row.role, status: row.status }
    : { username: '', nickname: '', password: '', role: 'reviewer', status: 1 })
  modalOpen.value = true
}

async function save() {
  error.value = ''
  if (!editingId.value && !/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) return (error.value = '用户名需 4-20 位字母、数字或下划线')
  if (!editingId.value && form.password.length < 8) return (error.value = '初始密码至少 8 位')
  if (editingId.value && form.password && form.password.length < 8) return (error.value = '密码至少 8 位')

  saving.value = true
  try {
    if (editingId.value) {
      await adminApi.updateUser(editingId.value, {
        nickname: form.nickname || undefined,
        role: form.role,
        status: form.status,
        password: form.password || undefined
      })
    } else {
      await adminApi.createUser({ ...form })
    }
    modalOpen.value = false
    showToast('保存成功')
    load()
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function go(p: number) {
  if (p < 1 || (data.value && p > data.value.totalPages)) return
  page.value = p
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="font-display text-[20px]">账号与权限</h2>
        <p class="mt-1 text-[11px] text-soft">管理员可管理全部内容与配置；审核员仅可处理内容与工单，不能删除与修改站点配置。</p>
      </div>
      <button v-if="admin.isAdmin" class="btn-primary text-[12px]" @click="open()">+ 新增后台账号</button>
    </div>

    <div v-if="!admin.isAdmin" class="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[11px] text-amber-200">
      审核员账号无账号管理权限，此页仅可查看。
    </div>

    <div class="mt-5 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left">
          <thead>
            <tr class="border-b border-line text-[10px] text-soft/60">
              <th class="px-4 py-2.5 font-normal">账号</th>
              <th class="px-3 py-2.5 font-normal">昵称</th>
              <th class="px-3 py-2.5 font-normal">角色</th>
              <th class="px-3 py-2.5 font-normal">状态</th>
              <th class="px-3 py-2.5 font-normal">最近登录</th>
              <th class="px-3 py-2.5 font-normal">创建时间</th>
              <th class="px-4 py-2.5 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-10 text-center text-[12px] text-soft">加载中…</td>
            </tr>
            <tr v-for="u in data?.list" :key="u.id" class="border-b border-line/40 last:border-b-0 hover:bg-white/[0.03]">
              <td class="px-4 py-2.5 text-[12px]">{{ u.username }}</td>
              <td class="px-3 py-2.5 text-[11px] text-soft">{{ u.nickname }}</td>
              <td class="px-3 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[9px]" :class="u.role === 'admin' ? 'bg-gold-400/15 text-gold' : 'bg-indigo-400/15 text-indigo-300'">
                  {{ u.role === 'admin' ? '管理员' : '审核员' }}
                </span>
              </td>
              <td class="px-3 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[9px]" :class="u.status === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-soft'">
                  {{ u.status === 1 ? '正常' : '已禁用' }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ u.lastLoginAt || '—' }}</td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ String(u.createdAt || '').slice(0, 10) }}</td>
              <td class="px-4 py-2.5 text-right">
                <button v-if="admin.isAdmin" class="text-[10px] text-soft transition hover:text-gold" @click="open(u)">编辑</button>
                <span v-else class="text-[10px] text-soft/40">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="data && data.totalPages > 1" class="mt-5 flex items-center justify-end gap-3 text-[11px]">
      <button class="btn-ghost !py-1.5 text-[11px]" :disabled="!canPrev" :class="{ 'opacity-30': !canPrev }" @click="go(page - 1)">上一页</button>
      <span class="text-soft">{{ page }} / {{ data.totalPages }}</span>
      <button class="btn-ghost !py-1.5 text-[11px]" :disabled="!canNext" :class="{ 'opacity-30': !canNext }" @click="go(page + 1)">下一页</button>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? '编辑账号' : '新增后台账号'" @close="modalOpen = false">
      <div class="grid gap-3">
        <div>
          <label class="mb-1 block text-[11px] text-soft">账号</label>
          <input v-model="form.username" class="field" :disabled="Boolean(editingId)" maxlength="20" placeholder="4-20 位字母、数字或下划线" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">昵称</label>
          <input v-model="form.nickname" class="field" maxlength="20" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">{{ editingId ? '重置密码（留空则不修改）' : '初始密码 *' }}</label>
          <input v-model="form.password" type="password" class="field" placeholder="至少 8 位" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-[11px] text-soft">角色</label>
            <select v-model="form.role" class="field">
              <option value="admin">管理员</option>
              <option value="reviewer">审核员</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-[11px] text-soft">状态</label>
            <select v-model="form.status" class="field">
              <option :value="1">正常</option>
              <option :value="0">禁用</option>
            </select>
          </div>
        </div>
      </div>

      <p class="mt-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[10px] leading-relaxed text-soft/70">
        权限隔离：后台 JWT 与前台用户 token 完全独立；删除类操作仅管理员可执行。
      </p>

      <p v-if="error" class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{{ error }}</p>

      <template #footer>
        <button class="btn-ghost text-[12px]" @click="modalOpen = false">取消</button>
        <button class="btn-primary text-[12px]" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存' }}</button>
      </template>
    </AdminModal>

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">{{ toast }}</div>
    </Transition>
  </div>
</template>
