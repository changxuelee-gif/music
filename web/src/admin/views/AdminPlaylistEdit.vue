<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api'
import { PLATFORM_LABELS } from '@/utils/platform'

const route = useRoute()
const router = useRouter()

const id = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEdit = computed(() => Boolean(id.value))

const categories = ref<any[]>([])
const tags = ref<any[]>([])
const artists = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const toast = ref('')

const form = reactive({
  title: '',
  slug: '',
  cover: '',
  summary: '',
  description: '',
  categoryId: '' as number | '',
  sceneId: '' as number | '',
  languageId: '' as number | '',
  curator: '声屿编辑部',
  isFeatured: false,
  isHot: false,
  isNew: false,
  status: 1,
  sort: 10,
  seoTitle: '',
  seoKeywords: '',
  seoDesc: '',
  tagIds: [] as number[]
})

interface SongRow {
  uid: number
  title: string
  artistName: string
  artistId: number | ''
  platform: string
  url: string
  duration: string
  sort: number
  status: number
  check: 'idle' | 'pending' | 'ok' | 'bad'
  checkMsg: string
}

let uid = 0
const songRows = ref<SongRow[]>([])

const styleCategories = computed(() => categories.value.filter((c) => c.type === 'style'))
const sceneCategories = computed(() => categories.value.filter((c) => c.type === 'scene'))
const languageCategories = computed(() => categories.value.filter((c) => c.type === 'language'))

const platforms = Object.entries(PLATFORM_LABELS).map(([key, label]) => ({ key, label }))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2600)
}

function blankSong(): SongRow {
  return {
    uid: ++uid, title: '', artistName: '', artistId: '', platform: 'qq', url: '',
    duration: '', sort: (songRows.value.length + 1) * 10, status: 1, check: 'idle', checkMsg: ''
  }
}

function addSong() {
  songRows.value.push(blankSong())
}

function removeSong(index: number) {
  songRows.value.splice(index, 1)
}

function moveSong(index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= songRows.value.length) return
  const arr = songRows.value
  ;[arr[index], arr[target]] = [arr[target], arr[index]]
  arr.forEach((s, i) => { s.sort = (i + 1) * 10 })
}

/** 实时校验外链域名与平台一致性（后端白名单为最终裁判） */
async function checkUrl(row: SongRow) {
  row.checkMsg = ''
  if (!row.url.trim()) {
    row.check = 'idle'
    return
  }
  row.check = 'pending'
  try {
    const res = await adminApi.validateUrl(row.url.trim())
    if (res.allowed) {
      row.check = 'ok'
      row.checkMsg = `已通过白名单校验 · ${PLATFORM_LABELS[res.platform] || res.platform}`
      if (res.platform) row.platform = res.platform
    } else {
      row.check = 'bad'
      row.checkMsg = '不在正版平台白名单内，禁止保存'
    }
  } catch (e: any) {
    row.check = 'bad'
    row.checkMsg = e.message || '链接格式不合法'
  }
}

async function uploadCover(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const res = await adminApi.uploadImage(file)
    form.cover = res.url
    showToast(`封面上传成功（${res.provider}）`)
  } catch (err: any) {
    error.value = err.message
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function submit() {
  error.value = ''
  if (!form.title.trim()) return (error.value = '请填写歌单标题')
  if (!form.summary.trim()) return (error.value = '请填写一句话简介')

  const rows = songRows.value.filter((s) => s.title.trim() || s.url.trim())
  for (const [i, s] of rows.entries()) {
    if (!s.title.trim()) return (error.value = `第 ${i + 1} 条歌曲缺少歌名`)
    if (!s.artistName.trim()) return (error.value = `第 ${i + 1} 条歌曲缺少歌手`)
    await checkUrl(s)
    if (s.check !== 'ok') return (error.value = `第 ${i + 1} 条歌曲链接未通过白名单校验，请修正后再保存`)
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      categoryId: form.categoryId || null,
      sceneId: form.sceneId || null,
      languageId: form.languageId || null,
      songs: rows.map((s) => ({
        title: s.title.trim(),
        artistName: s.artistName.trim(),
        artistId: s.artistId || null,
        platform: s.platform,
        url: s.url.trim(),
        duration: s.duration.trim(),
        sort: Number(s.sort) || 0,
        status: s.status
      }))
    }
    if (isEdit.value && id.value) await adminApi.updatePlaylist(id.value, payload)
    else await adminApi.createPlaylist(payload)
    showToast('保存成功')
    setTimeout(() => router.push('/admin/playlists'), 600)
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function loadAll() {
  loading.value = true
  try {
    const [cats, tagList, artistList] = await Promise.all([
      adminApi.categories(), adminApi.tags(), adminApi.artists()
    ])
    categories.value = cats
    tags.value = tagList
    artists.value = artistList

    if (isEdit.value && id.value) {
      const p = await adminApi.playlist(id.value)
      Object.assign(form, {
        title: p.title, slug: p.slug, cover: p.cover, summary: p.summary, description: p.description,
        categoryId: p.categoryId || '', sceneId: p.sceneId || '', languageId: p.languageId || '',
        curator: p.curator || '', isFeatured: p.isFeatured, isHot: p.isHot, isNew: p.isNew,
        status: p.status, sort: p.sort, seoTitle: p.seoTitle || '', seoKeywords: p.seoKeywords || '', seoDesc: p.seoDesc || '',
        tagIds: p.tagIds || []
      })
      songRows.value = (p.songs || []).map((s: any) => ({
        uid: ++uid, title: s.title, artistName: s.artistName, artistId: s.artistId || '',
        platform: s.platform, url: s.url, duration: s.duration || '', sort: s.sort || 10,
        status: s.status ?? 1, check: 'ok', checkMsg: '历史条目（保存时再次校验）'
      }))
    }
    if (!songRows.value.length) addSong()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <RouterLink to="/admin/playlists" class="btn-icon h-9 w-9">
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
        </RouterLink>
        <div>
          <h2 class="font-display text-[20px]">{{ isEdit ? '编辑歌单' : '新建歌单' }}</h2>
          <p class="mt-0.5 text-[11px] text-soft">所有歌曲链接必须属于正版平台白名单域名</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-ghost text-[12px]" @click="router.push('/admin/playlists')">取消</button>
        <button class="btn-primary text-[12px]" :disabled="saving" @click="submit">{{ saving ? '保存中…' : '保存歌单' }}</button>
      </div>
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{{ error }}</p>
    <div v-if="loading" class="mt-5 h-60 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <div v-else class="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
      <!-- 主表单 -->
      <div class="space-y-5">
        <section class="glass-card p-5 md:p-6">
          <h3 class="font-display text-[16px]">基础信息</h3>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-[11px] text-soft">歌单标题 <span class="text-gold">*</span></label>
              <input v-model="form.title" class="field" maxlength="100" placeholder="例如：山河入梦 · 国风精选" />
            </div>
            <div>
              <label class="mb-1.5 block text-[11px] text-soft">slug（SEO 路由）</label>
              <input v-model="form.slug" class="field" maxlength="120" placeholder="guofeng-shanhe（仅小写字母/数字/连字符）" />
              <p class="mt-1 text-[10px] text-soft/60">留空自动生成；前台地址为 /playlist/&lt;slug&gt;</p>
            </div>
            <div>
              <label class="mb-1.5 block text-[11px] text-soft">策展人</label>
              <input v-model="form.curator" class="field" maxlength="50" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-[11px] text-soft">一句话简介 <span class="text-gold">*</span></label>
              <input v-model="form.summary" class="field" maxlength="255" placeholder="展示在卡片与搜索结果中" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-[11px] text-soft">详细介绍</label>
              <textarea v-model="form.description" class="field min-h-[110px]" maxlength="5000" placeholder="歌单的策展思路、适合场景等"></textarea>
            </div>
          </div>
        </section>

        <!-- 歌曲条目 -->
        <section class="glass-card p-5 md:p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-display text-[16px]">歌曲条目</h3>
              <p class="mt-0.5 text-[10px] text-soft">仅录入名称与正版平台跳转链接，禁止上传任何音频/歌词</p>
            </div>
            <button class="btn-ghost !py-1.5 text-[11px]" @click="addSong">+ 添加歌曲</button>
          </div>

          <div class="mt-4 space-y-3">
            <div v-for="(s, i) in songRows" :key="s.uid" class="rounded-xl border border-line bg-white/[0.02] p-3">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[10px] text-soft/60">#{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="flex items-center gap-2 text-[10px]">
                  <button class="text-soft/60 transition hover:text-gold" @click="moveSong(i, -1)">上移</button>
                  <button class="text-soft/60 transition hover:text-gold" @click="moveSong(i, 1)">下移</button>
                  <button class="text-soft/60 transition hover:text-red-300" @click="removeSong(i)">删除</button>
                </div>
              </div>

              <div class="grid gap-2 md:grid-cols-2">
                <input v-model="s.title" class="field !h-9 text-[12px]" placeholder="歌曲名称 *" maxlength="120" />
                <input v-model="s.artistName" class="field !h-9 text-[12px]" placeholder="歌手名称 *" maxlength="120" />
                <div class="md:col-span-2">
                  <input
                    v-model="s.url"
                    class="field !h-9 text-[12px]"
                    :class="s.check === 'bad' ? '!border-red-400/60' : s.check === 'ok' ? '!border-emerald-400/40' : ''"
                    placeholder="正版平台链接，例如 https://y.qq.com/n/ryqq/songDetail/xxxx"
                    maxlength="500"
                    @blur="checkUrl(s)"
                  />
                  <p v-if="s.checkMsg" class="mt-1 text-[10px]" :class="s.check === 'bad' ? 'text-red-300' : s.check === 'ok' ? 'text-emerald-300' : 'text-soft'">
                    {{ s.check === 'ok' ? '✓' : s.check === 'bad' ? '✕' : '…' }} {{ s.checkMsg }}
                  </p>
                </div>
                <div class="grid grid-cols-3 gap-2 md:col-span-2">
                  <select v-model="s.platform" class="field !h-9 text-[11px]">
                    <option v-for="p in platforms" :key="p.key" :value="p.key">{{ p.label }}</option>
                  </select>
                  <input v-model="s.duration" class="field !h-9 text-[11px]" placeholder="时长 04:12" maxlength="10" />
                  <select v-model="s.artistId" class="field !h-9 text-[11px]">
                    <option value="">关联音乐人（选填）</option>
                    <option v-for="a in artists" :key="a.id" :value="a.id">{{ a.name }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <p class="mt-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[10px] leading-relaxed text-soft/70">
            保存时后端会再次校验域名白名单与平台一致性；任何非正版平台链接都会被拒绝写入。
          </p>
        </section>

        <!-- 标签 -->
        <section class="glass-card p-5 md:p-6">
          <h3 class="font-display text-[16px]">标签</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="t in tags"
              :key="t.id"
              class="chip"
              :class="{ 'chip-active': form.tagIds.includes(t.id) }"
              @click="form.tagIds.includes(t.id) ? form.tagIds = form.tagIds.filter((x) => x !== t.id) : form.tagIds.push(t.id)"
            >
              {{ t.name }}
            </button>
          </div>
        </section>
      </div>

      <!-- 侧栏 -->
      <aside class="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <section class="glass-card p-5">
          <h3 class="font-display text-[15px]">封面</h3>
          <div class="mt-3 overflow-hidden rounded-xl border border-line bg-white/[0.03]">
            <img v-if="form.cover" :src="form.cover" class="aspect-square w-full object-cover" />
            <div v-else class="grid aspect-square place-items-center text-[11px] text-soft">暂无封面</div>
          </div>
          <label class="btn-ghost mt-3 flex cursor-pointer justify-center text-[11px]">
            {{ uploading ? '上传中…' : '上传封面图片' }}
            <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp" @change="uploadCover" />
          </label>
          <input v-model="form.cover" class="field mt-2 !h-9 text-[11px]" placeholder="或直接填写图片 URL" />
        </section>

        <section class="glass-card p-5">
          <h3 class="font-display text-[15px]">分类与场景</h3>
          <div class="mt-3 space-y-3">
            <div>
              <label class="mb-1 block text-[10px] text-soft">音乐风格</label>
              <select v-model="form.categoryId" class="field !h-9 text-[11px]">
                <option value="">请选择</option>
                <option v-for="c in styleCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[10px] text-soft">适用场景</label>
              <select v-model="form.sceneId" class="field !h-9 text-[11px]">
                <option value="">请选择</option>
                <option v-for="c in sceneCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-[10px] text-soft">语种</label>
              <select v-model="form.languageId" class="field !h-9 text-[11px]">
                <option value="">请选择</option>
                <option v-for="c in languageCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
        </section>

        <section class="glass-card p-5">
          <h3 class="font-display text-[15px]">展示设置</h3>
          <div class="mt-3 space-y-2.5">
            <label class="flex cursor-pointer items-center justify-between text-[11px] text-soft">
              <span>精选推荐</span>
              <input v-model="form.isFeatured" type="checkbox" class="h-4 w-4 accent-[#e8c56b]" />
            </label>
            <label class="flex cursor-pointer items-center justify-between text-[11px] text-soft">
              <span>热门标记</span>
              <input v-model="form.isHot" type="checkbox" class="h-4 w-4 accent-[#e8c56b]" />
            </label>
            <label class="flex cursor-pointer items-center justify-between text-[11px] text-soft">
              <span>新收录</span>
              <input v-model="form.isNew" type="checkbox" class="h-4 w-4 accent-[#e8c56b]" />
            </label>
            <div class="flex items-center justify-between pt-2">
              <span class="text-[11px] text-soft">排序权重</span>
              <input v-model.number="form.sort" type="number" class="field !h-8 !w-20 text-[11px]" />
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[11px] text-soft">状态</span>
              <select v-model="form.status" class="field !h-8 !w-24 text-[11px]">
                <option :value="1">上架</option>
                <option :value="0">下架</option>
              </select>
            </div>
          </div>
        </section>

        <section class="glass-card p-5">
          <h3 class="font-display text-[15px]">SEO</h3>
          <div class="mt-3 space-y-2.5">
            <input v-model="form.seoTitle" class="field !h-9 text-[11px]" placeholder="SEO 标题" maxlength="200" />
            <input v-model="form.seoKeywords" class="field !h-9 text-[11px]" placeholder="SEO 关键词（英文逗号分隔）" maxlength="200" />
            <textarea v-model="form.seoDesc" class="field text-[11px]" rows="3" placeholder="SEO 描述" maxlength="500"></textarea>
          </div>
        </section>
      </aside>
    </div>

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">{{ toast }}</div>
    </Transition>
  </div>
</template>
