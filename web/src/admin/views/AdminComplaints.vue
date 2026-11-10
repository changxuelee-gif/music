<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/api'
import type { Paged } from '@/types'
import AdminModal from '@/admin/components/AdminModal.vue'

const data = ref<Paged<any> | null>(null)
const loading = ref(false)
const status = ref('')
const keyword = ref('')
const page = ref(1)
const toast = ref('')

const detailOpen = ref(false)
const current = ref<any>(null)
const handleStatus = ref('processing')
const reply = ref('')
const saving = ref(false)
const error = ref('')

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: '待处理', cls: 'bg-red-500/15 text-red-300' },
  processing: { label: '处理中', cls: 'bg-amber-500/15 text-amber-300' },
  done: { label: '已完成', cls: 'bg-emerald-500/15 text-emerald-300' },
  rejected: { label: '已驳回', cls: 'bg-white/5 text-soft' }
}

const typeLabels: Record<string, string> = {
  copyright: '版权投诉', info: '信息不实', link: '失效链接', other: '其他'
}

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => Boolean(data.value && page.value < data.value.totalPages))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    data.value = await adminApi.complaints({
      page: page.value,
      pageSize: 12,
      status: status.value || undefined,
      keyword: keyword.value || undefined
    })
  } catch (e: any) {
    showToast(e.message)
  } finally {
    loading.value = false
  }
}

function openDetail(row: any) {
  current.value = row
  handleStatus.value = row.status === 'pending' ? 'processing' : row.status
  reply.value = row.reply || ''
  error.value = ''
  detailOpen.value = true
}

async function save() {
  if (!current.value) return
  if (!reply.value.trim()) return (error.value = '请填写处理说明 / 回复内容')
  saving.value = true
  error.value = ''
  try {
    await adminApi.handleComplaint(current.value.id, { status: handleStatus.value, reply: reply.value.trim() })
    detailOpen.value = false
    showToast('工单已更新')
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
        <h2 class="font-display text-[20px]">版权投诉工单</h2>
        <p class="mt-1 text-[11px] text-soft">依据权利通知核查站内信息，涉及第三方平台的音源请引导投诉人向平台主张权利。</p>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="keyword" class="field !h-9 !w-52 text-[11px]" placeholder="工单号 / 投诉人 / 链接" @keyup.enter="page = 1; load()" />
        <select v-model="status" class="field !h-9 !w-28 text-[11px]" @change="page = 1; load()">
          <option value="">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="done">已完成</option>
          <option value="rejected">已驳回</option>
        </select>
        <button class="btn-ghost !py-2 text-[11px]" @click="page = 1; load()">查询</button>
      </div>
    </div>

    <div class="mt-5 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[820px] text-left">
          <thead>
            <tr class="border-b border-line text-[10px] text-soft/60">
              <th class="px-4 py-2.5 font-normal">工单号</th>
              <th class="px-3 py-2.5 font-normal">投诉人 / 联系方式</th>
              <th class="px-3 py-2.5 font-normal">类型</th>
              <th class="px-3 py-2.5 font-normal">投诉说明</th>
              <th class="px-3 py-2.5 font-normal">状态</th>
              <th class="px-4 py-2.5 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-10 text-center text-[12px] text-soft">加载中…</td>
            </tr>
            <tr v-else-if="!data?.list.length">
              <td colspan="6" class="px-4 py-10 text-center text-[12px] text-soft">暂无工单。</td>
            </tr>
            <tr v-for="c in data?.list" :key="c.id" class="border-b border-line/40 last:border-b-0 hover:bg-white/[0.03]">
              <td class="px-4 py-3">
                <p class="text-[11px]">{{ c.ticketNo }}</p>
                <p class="mt-0.5 text-[9px] text-soft/50">{{ c.createdAt }}</p>
              </td>
              <td class="px-3 py-3 text-[10px] text-soft">
                <p class="text-main">{{ c.name }}</p>
                <p class="mt-0.5">{{ c.contact }}</p>
              </td>
              <td class="px-3 py-3 text-[10px] text-soft">{{ typeLabels[c.type] || c.type }}</td>
              <td class="max-w-[280px] px-3 py-3">
                <p class="line-clamp-2 text-[10px] leading-relaxed text-soft">{{ c.description }}</p>
              </td>
              <td class="px-3 py-3">
                <span class="rounded-full px-2 py-0.5 text-[9px]" :class="statusMap[c.status]?.cls">{{ statusMap[c.status]?.label }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <button class="text-[10px] text-soft transition hover:text-gold" @click="openDetail(c)">查看 / 处理</button>
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

    <AdminModal :open="detailOpen" title="投诉工单详情" wide @close="detailOpen = false">
      <div v-if="current" class="space-y-4">
        <div class="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
          <span class="text-[12px] text-main">{{ current.ticketNo }}</span>
          <span class="rounded-full px-2 py-0.5 text-[9px]" :class="statusMap[current.status]?.cls">{{ statusMap[current.status]?.label }}</span>
          <span class="text-[10px] text-soft">{{ current.createdAt }}</span>
        </div>

        <div class="grid gap-3 text-[11px] md:grid-cols-2">
          <div><p class="text-soft/60">投诉人</p><p class="mt-1 text-main">{{ current.name }}</p></div>
          <div><p class="text-soft/60">联系方式</p><p class="mt-1 text-main">{{ current.contact }}</p></div>
          <div><p class="text-soft/60">投诉类型</p><p class="mt-1 text-main">{{ typeLabels[current.type] || current.type }}</p></div>
          <div>
            <p class="text-soft/60">涉嫌链接</p>
            <a v-if="current.targetUrl" :href="current.targetUrl" target="_blank" rel="noopener noreferrer" class="mt-1 block break-all text-gold">{{ current.targetUrl }}</a>
            <p v-else class="mt-1 text-soft">—</p>
          </div>
        </div>

        <div>
          <p class="text-[11px] text-soft/60">投诉说明</p>
          <p class="mt-1 whitespace-pre-wrap rounded-lg border border-line bg-white/[0.02] p-3 text-[11px] leading-relaxed text-soft">{{ current.description }}</p>
        </div>

        <div v-if="current.evidenceUrl">
          <p class="text-[11px] text-soft/60">权属材料</p>
          <a :href="current.evidenceUrl" target="_blank" rel="noopener noreferrer" class="mt-1 inline-block text-[11px] text-gold">查看材料 ↗</a>
        </div>

        <div v-if="current.reply" class="rounded-lg border border-line bg-white/[0.02] p-3 text-[11px] leading-relaxed text-soft">
          <p class="text-soft/60">历史回复（{{ current.handlerName || '—' }} · {{ current.handledAt || '—' }}）</p>
          <p class="mt-1">{{ current.reply }}</p>
        </div>

        <div class="grid gap-3 md:grid-cols-[160px_1fr]">
          <div>
            <label class="mb-1 block text-[11px] text-soft">处理状态</label>
            <select v-model="handleStatus" class="field">
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="done">已完成</option>
              <option value="rejected">已驳回</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-[11px] text-soft">处理说明 / 回复</label>
            <textarea v-model="reply" class="field" rows="3" maxlength="2000" placeholder="说明核查结论与处置措施"></textarea>
          </div>
        </div>

        <p v-if="error" class="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{{ error }}</p>
      </div>

      <template #footer>
        <button class="btn-ghost text-[12px]" @click="detailOpen = false">取消</button>
        <button class="btn-primary text-[12px]" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存处理结果' }}</button>
      </template>
    </AdminModal>

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">{{ toast }}</div>
    </Transition>
  </div>
</template>
