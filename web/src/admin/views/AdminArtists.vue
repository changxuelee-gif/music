<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/api'
import AdminModal from '@/admin/components/AdminModal.vue'
import { platformLabel } from '@/utils/track'
import { PLATFORM_LABELS } from '@/utils/platform'

const artists = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const toast = ref('')
const modalOpen = ref(false)
const editingId = ref<number | null>(null)
const urlCheck = ref<'idle' | 'ok' | 'bad'>('idle')
const urlMsg = ref('')
const uploading = ref(false)

const form = reactive({
  name: '', slug: '', avatar: '', country: '中国', genre: '', platform: 'qq',
  officialUrl: '', bio: '', isHot: false, sort: 10, status: 1
})

const platforms = Object.entries(PLATFORM_LABELS).map(([key, label]) => ({ key, label }))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    artists.value = await adminApi.artists()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function open(row?: any) {
  error.value = ''
  editingId.value = row?.id || null
  urlCheck.value = 'idle'
  urlMsg.value = ''
  Object.assign(form, row
    ? {
        name: row.name, slug: row.slug, avatar: row.avatar || '', country: row.country || '',
        genre: row.genre || '', platform: row.platform || 'qq', officialUrl: row.officialUrl || '',
        bio: row.bio || '', isHot: Boolean(row.isHot), sort: row.sort ?? 10, status: row.status ?? 1
      }
    : { name: '', slug: '', avatar: '', country: '中国', genre: '', platform: 'qq', officialUrl: '', bio: '', isHot: false, sort: 10, status: 1 })
  if (form.officialUrl) checkUrl()
  modalOpen.value = true
}

async function checkUrl() {
  if (!form.officialUrl.trim()) {
    urlCheck.value = 'idle'
    return
  }
  try {
    const res = await adminApi.validateUrl(form.officialUrl.trim())
    urlCheck.value = res.allowed ? 'ok' : 'bad'
    urlMsg.value = res.allowed ? `白名单通过 · ${PLATFORM_LABELS[res.platform] || res.platform}` : '不在正版平台白名单内'
    if (res.allowed && res.platform) form.platform = res.platform
  } catch (e: any) {
    urlCheck.value = 'bad'
    urlMsg.value = e.message
  }
}

async function uploadAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await adminApi.uploadImage(file)
    form.avatar = res.url
  } catch (err: any) {
    error.value = err.message
  } finally {
    uploading.value = false
  }
}

async function save() {
  error.value = ''
  if (!form.name.trim()) return (error.value = '请填写音乐人名称')
  if (!form.officialUrl.trim()) return (error.value = '请填写官方主页链接')
  await checkUrl()
  if (urlCheck.value !== 'ok') return (error.value = '官方主页链接未通过白名单校验')

  saving.value = true
  try {
    if (editingId.value) await adminApi.updateArtist(editingId.value, { ...form })
    else await adminApi.createArtist({ ...form })
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
  if (!window.confirm(`删除音乐人「${row.name}」？关联歌曲条目将保留但解绑。`)) return
  try {
    await adminApi.deleteArtist(row.id)
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
        <h2 class="font-display text-[20px]">音乐人管理</h2>
        <p class="mt-1 text-[11px] text-soft">官方主页链接必须属于正版平台白名单域名，保存前需通过校验。</p>
      </div>
      <button class="btn-primary text-[12px]" @click="open()">+ 新增音乐人</button>
    </div>

    <div v-if="loading" class="mt-5 h-52 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <div v-else class="mt-5 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left">
          <thead>
            <tr class="border-b border-line text-[10px] text-soft/60">
              <th class="px-4 py-2.5 font-normal">音乐人</th>
              <th class="px-3 py-2.5 font-normal">风格 / 地区</th>
              <th class="px-3 py-2.5 font-normal">平台</th>
              <th class="px-3 py-2.5 font-normal">官方主页</th>
              <th class="px-3 py-2.5 font-normal">关联歌单</th>
              <th class="px-3 py-2.5 font-normal">状态</th>
              <th class="px-4 py-2.5 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in artists" :key="a.id" class="border-b border-line/40 last:border-b-0 hover:bg-white/[0.03]">
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-3">
                  <img :src="a.avatar" class="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p class="text-[12px]">{{ a.name }} <span v-if="a.isHot" class="ml-1 text-[9px] text-gold">HOT</span></p>
                    <p class="text-[10px] text-soft/60">/{{ a.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-2.5 text-[10px] text-soft">
                <p>{{ a.genre }}</p>
                <p class="text-soft/60">{{ a.country }}</p>
              </td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ platformLabel(a.platform) }}</td>
              <td class="max-w-[220px] px-3 py-2.5">
                <a :href="a.officialUrl" target="_blank" rel="noopener noreferrer" class="line-clamp-1 text-[10px] text-soft transition hover:text-gold">{{ a.officialUrl }}</a>
              </td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ a.playlistCount }}</td>
              <td class="px-3 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[9px]" :class="a.status === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-soft'">
                  {{ a.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-right whitespace-nowrap">
                <button class="text-[10px] text-soft transition hover:text-gold" @click="open(a)">编辑</button>
                <button class="ml-3 text-[10px] text-soft/60 transition hover:text-red-300" @click="remove(a)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AdminModal :open="modalOpen" :title="editingId ? '编辑音乐人' : '新增音乐人'" @close="modalOpen = false">
      <div class="grid gap-3 md:grid-cols-2">
        <div>
          <label class="mb-1 block text-[11px] text-soft">名称 *</label>
          <input v-model="form.name" class="field" maxlength="80" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">slug</label>
          <input v-model="form.slug" class="field" maxlength="100" placeholder="留空自动生成" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">国家/地区</label>
          <input v-model="form.country" class="field" maxlength="30" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">风格</label>
          <input v-model="form.genre" class="field" maxlength="60" placeholder="流行 / 国风" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">官方主页链接 *（白名单校验）</label>
          <input
            v-model="form.officialUrl"
            class="field"
            :class="urlCheck === 'bad' ? '!border-red-400/60' : urlCheck === 'ok' ? '!border-emerald-400/40' : ''"
            maxlength="500"
            placeholder="https://y.qq.com/…"
            @blur="checkUrl"
          />
          <p v-if="urlMsg" class="mt-1 text-[10px]" :class="urlCheck === 'bad' ? 'text-red-300' : 'text-emerald-300'">{{ urlMsg }}</p>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">平台</label>
          <select v-model="form.platform" class="field">
            <option v-for="p in platforms" :key="p.key" :value="p.key">{{ p.label }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">排序</label>
          <input v-model.number="form.sort" type="number" class="field" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">简介</label>
          <textarea v-model="form.bio" class="field" rows="3" maxlength="500"></textarea>
        </div>
        <div class="md:col-span-2 flex items-center gap-4">
          <img v-if="form.avatar" :src="form.avatar" class="h-12 w-12 rounded-full object-cover" />
          <label class="btn-ghost cursor-pointer text-[11px]">
            {{ uploading ? '上传中…' : '上传头像' }}
            <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp" @change="uploadAvatar" />
          </label>
          <label class="flex items-center gap-2 text-[11px] text-soft">
            <input v-model="form.isHot" type="checkbox" class="h-4 w-4 accent-[#e8c56b]" /> 热门音乐人
          </label>
          <select v-model="form.status" class="field !h-8 !w-24 text-[11px]">
            <option :value="1">启用</option>
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
