<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/api'
import AdminModal from '@/admin/components/AdminModal.vue'

const banners = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const toast = ref('')
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const uploading = ref(false)

const form = reactive({
  title: '', subtitle: '', badge: '', image: '', theme: 'indigo',
  linkType: 'playlist', linkValue: '', position: 'home_hero', sort: 10, status: 1,
  startAt: '', endAt: ''
})

const themes = [
  { key: 'indigo', label: '靛蓝' },
  { key: 'violet', label: '暗紫' },
  { key: 'gold', label: '金色' }
]

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    banners.value = await adminApi.banners()
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
    ? {
        title: row.title, subtitle: row.subtitle || '', badge: row.badge || '', image: row.image || '',
        theme: row.theme || 'indigo', linkType: row.linkType || 'none', linkValue: row.linkValue || '',
        position: row.position || 'home_hero', sort: row.sort ?? 10, status: row.status ?? 1,
        startAt: row.startAt ? String(row.startAt).slice(0, 16).replace(' ', 'T') : '',
        endAt: row.endAt ? String(row.endAt).slice(0, 16).replace(' ', 'T') : ''
      }
    : { title: '', subtitle: '', badge: '', image: '', theme: 'indigo', linkType: 'playlist', linkValue: '', position: 'home_hero', sort: 10, status: 1, startAt: '', endAt: '' })
  modalOpen.value = true
}

async function uploadImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await adminApi.uploadImage(file)
    form.image = res.url
  } catch (err: any) {
    error.value = err.message
  } finally {
    uploading.value = false
  }
}

async function save() {
  error.value = ''
  if (!form.title.trim()) return (error.value = '请填写标题')
  if (!form.image.trim()) return (error.value = '请上传或填写背景图')

  saving.value = true
  try {
    const payload = {
      ...form,
      startAt: form.startAt ? form.startAt.replace('T', ' ') + ':00' : null,
      endAt: form.endAt ? form.endAt.replace('T', ' ') + ':00' : null
    }
    if (editingId.value) await adminApi.updateBanner(editingId.value, payload)
    else await adminApi.createBanner(payload)
    modalOpen.value = false
    showToast('保存成功')
    load()
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function remove(row: any) {
  if (!window.confirm(`删除 Banner「${row.title}」？`)) return
  try {
    await adminApi.deleteBanner(row.id)
    showToast('已删除')
    load()
  } catch (e: any) {
    showToast(e.message)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="font-display text-[20px]">首页 Banner / 专题</h2>
        <p class="mt-1 text-[11px] text-soft">跳转目标只支持站内歌单 / 音乐人 / 分类，禁止填写站外链接。</p>
      </div>
      <button class="btn-primary text-[12px]" @click="open()">+ 新增 Banner</button>
    </div>

    <div v-if="loading" class="mt-5 h-52 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <div v-else class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="b in banners" :key="b.id" class="glass-card overflow-hidden">
        <div class="relative aspect-[16/7] overflow-hidden border-b border-line">
          <img :src="b.image" class="h-full w-full object-cover" />
          <span class="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur">{{ b.badge || '专题' }}</span>
          <span class="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px]" :class="b.status === 1 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-black/40 text-white/70'">
            {{ b.status === 1 ? '展示中' : '已停用' }}
          </span>
        </div>
        <div class="p-4">
          <p class="font-display text-[16px]">{{ b.title }}</p>
          <p class="mt-1 line-clamp-2 text-[11px] text-soft">{{ b.subtitle }}</p>
          <div class="mt-3 flex items-center gap-2 text-[10px] text-soft/70">
            <span class="chip !py-0.5">{{ b.theme }}</span>
            <span class="chip !py-0.5">{{ b.linkType }}: {{ b.linkValue || '—' }}</span>
            <span class="ml-auto">{{ b.position }}</span>
          </div>
          <div class="mt-3 flex justify-end gap-3 text-[10px]">
            <button class="text-soft transition hover:text-gold" @click="open(b)">编辑</button>
            <button class="text-soft/60 transition hover:text-red-300" @click="remove(b)">删除</button>
          </div>
        </div>
      </div>

      <div v-if="!banners.length" class="col-span-full rounded-2xl border border-dashed border-line px-6 py-12 text-center text-[12px] text-soft">
        还没有 Banner，点击右上角新增。
      </div>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? '编辑 Banner' : '新增 Banner'" wide @close="modalOpen = false">
      <div class="grid gap-3 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">标题 *</label>
          <input v-model="form.title" class="field" maxlength="100" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">副标题</label>
          <input v-model="form.subtitle" class="field" maxlength="200" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">角标文案</label>
          <input v-model="form.badge" class="field" maxlength="30" placeholder="本周专题" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">主题色</label>
          <select v-model="form.theme" class="field">
            <option v-for="t in themes" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">背景图 *</label>
          <div v-if="form.image" class="mb-2 overflow-hidden rounded-lg border border-line">
            <img :src="form.image" class="aspect-[16/6] w-full object-cover" />
          </div>
          <div class="flex items-center gap-2">
            <label class="btn-ghost shrink-0 cursor-pointer !py-2 text-[11px]">
              {{ uploading ? '上传中…' : '上传图片' }}
              <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp" @change="uploadImage" />
            </label>
            <input v-model="form.image" class="field !h-9 text-[11px]" placeholder="或填写图片 URL" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">跳转类型</label>
          <select v-model="form.linkType" class="field">
            <option value="playlist">歌单</option>
            <option value="artist">音乐人</option>
            <option value="category">分类</option>
            <option value="none">不跳转</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">跳转目标 slug</label>
          <input v-model="form.linkValue" class="field" maxlength="120" placeholder="guofeng-shanhe" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">展示位置</label>
          <select v-model="form.position" class="field">
            <option value="home_hero">首页 Hero</option>
            <option value="home_middle">首页中部</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">排序</label>
          <input v-model.number="form.sort" type="number" class="field" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">开始时间（选填）</label>
          <input v-model="form.startAt" type="datetime-local" class="field" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">结束时间（选填）</label>
          <input v-model="form.endAt" type="datetime-local" class="field" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">展示状态</label>
          <select v-model="form.status" class="field">
            <option :value="1">启用展示</option>
            <option :value="0">停用</option>
          </select>
        </div>
      </div>

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
