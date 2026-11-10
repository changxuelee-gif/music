<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { adminApi } from '@/api'
import AdminModal from '@/admin/components/AdminModal.vue'

const tab = ref<'category' | 'tag'>('category')
const categories = ref<any[]>([])
const tags = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const toast = ref('')

const modalOpen = ref(false)
const editingId = ref<number | null>(null)

const categoryForm = reactive({
  name: '', slug: '', type: 'style', icon: '🎵', color: '#5B6CFF',
  intro: '', sort: 10, status: 1, seoTitle: '', seoDesc: ''
})

const tagForm = reactive({
  name: '', slug: '', type: 'mood', color: '#E8C56B', sort: 10, status: 1
})

const typeLabels: Record<string, string> = { style: '风格', scene: '场景', language: '语种' }

const grouped = computed(() => {
  return ['style', 'scene', 'language'].map((t) => ({
    type: t,
    label: typeLabels[t],
    list: categories.value.filter((c) => c.type === t)
  }))
})

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    const [cats, tagList] = await Promise.all([adminApi.categories(), adminApi.tags()])
    categories.value = cats
    tags.value = tagList
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCategory(row?: any) {
  error.value = ''
  editingId.value = row?.id || null
  Object.assign(categoryForm, row
    ? {
        name: row.name, slug: row.slug, type: row.type, icon: row.icon || '🎵', color: row.color || '#5B6CFF',
        intro: row.intro || '', sort: row.sort ?? 10, status: row.status ?? 1,
        seoTitle: row.seoTitle || '', seoDesc: row.seoDesc || ''
      }
    : { name: '', slug: '', type: 'style', icon: '🎵', color: '#5B6CFF', intro: '', sort: 10, status: 1, seoTitle: '', seoDesc: '' })
  modalOpen.value = true
}

function openTag(row?: any) {
  error.value = ''
  editingId.value = row?.id || null
  Object.assign(tagForm, row
    ? { name: row.name, slug: row.slug, type: row.type || 'mood', color: row.color || '#E8C56B', sort: row.sort ?? 10, status: row.status ?? 1 }
    : { name: '', slug: '', type: 'mood', color: '#E8C56B', sort: 10, status: 1 })
  modalOpen.value = true
}

async function save() {
  error.value = ''
  saving.value = true
  try {
    if (tab.value === 'category') {
      if (!categoryForm.name.trim()) throw new Error('请填写分类名称')
      if (editingId.value) await adminApi.updateCategory(editingId.value, { ...categoryForm })
      else await adminApi.createCategory({ ...categoryForm })
    } else {
      if (!tagForm.name.trim()) throw new Error('请填写标签名称')
      if (editingId.value) await adminApi.updateTag(editingId.value, { ...tagForm })
      else await adminApi.createTag({ ...tagForm })
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

async function removeCategory(row: any) {
  if (!window.confirm(`删除分类「${row.name}」？若仍有歌单使用该分类将无法删除。`)) return
  try {
    await adminApi.deleteCategory(row.id)
    showToast('已删除')
    load()
  } catch (e: any) {
    showToast(e.message)
  }
}

async function removeTag(row: any) {
  if (!window.confirm(`删除标签「${row.name}」？`)) return
  try {
    await adminApi.deleteTag(row.id)
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
        <h2 class="font-display text-[20px]">分类与标签</h2>
        <p class="mt-1 text-[11px] text-soft">风格 / 场景 / 语种三个维度用于前台筛选，标签用于多选交叉检索。</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex rounded-full border border-line p-1">
          <button class="rounded-full px-4 py-1.5 text-[11px] transition" :class="tab === 'category' ? 'bg-white/10 text-main' : 'text-soft'" @click="tab = 'category'">分类</button>
          <button class="rounded-full px-4 py-1.5 text-[11px] transition" :class="tab === 'tag' ? 'bg-white/10 text-main' : 'text-soft'" @click="tab = 'tag'">标签</button>
        </div>
        <button class="btn-primary text-[12px]" @click="tab === 'category' ? openCategory() : openTag()">
          + 新增{{ tab === 'category' ? '分类' : '标签' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="mt-5 h-52 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <!-- 分类 -->
    <div v-else-if="tab === 'category'" class="mt-5 space-y-4">
      <div v-for="g in grouped" :key="g.type" class="overflow-hidden rounded-xl border border-line bg-white/[0.02]">
        <div class="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h3 class="text-[12px] text-main">{{ g.label }}<span class="ml-2 text-[10px] text-soft/60">{{ g.list.length }} 项</span></h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left">
            <thead>
              <tr class="border-b border-line/60 text-[10px] text-soft/60">
                <th class="px-4 py-2 font-normal">名称</th>
                <th class="px-3 py-2 font-normal">slug</th>
                <th class="px-3 py-2 font-normal">简介</th>
                <th class="px-3 py-2 font-normal">歌单数</th>
                <th class="px-3 py-2 font-normal">排序</th>
                <th class="px-3 py-2 font-normal">状态</th>
                <th class="px-4 py-2 text-right font-normal">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in g.list" :key="c.id" class="border-b border-line/40 last:border-b-0 hover:bg-white/[0.03]">
                <td class="px-4 py-2.5">
                  <span class="mr-2">{{ c.icon }}</span><span class="text-[12px]">{{ c.name }}</span>
                  <span class="ml-2 inline-block h-2 w-2 rounded-full align-middle" :style="{ background: c.color }"></span>
                </td>
                <td class="px-3 py-2.5 text-[10px] text-soft">{{ c.slug }}</td>
                <td class="max-w-[260px] truncate px-3 py-2.5 text-[10px] text-soft">{{ c.intro }}</td>
                <td class="px-3 py-2.5 text-[10px] text-soft">{{ c.playlistCount }}</td>
                <td class="px-3 py-2.5 text-[10px] text-soft">{{ c.sort }}</td>
                <td class="px-3 py-2.5">
                  <span class="rounded-full px-2 py-0.5 text-[9px]" :class="c.status === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-soft'">
                    {{ c.status === 1 ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-right whitespace-nowrap">
                  <button class="text-[10px] text-soft transition hover:text-gold" @click="openCategory(c)">编辑</button>
                  <button class="ml-3 text-[10px] text-soft/60 transition hover:text-red-300" @click="removeCategory(c)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 标签 -->
    <div v-else class="mt-5 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] text-left">
          <thead>
            <tr class="border-b border-line text-[10px] text-soft/60">
              <th class="px-4 py-2.5 font-normal">标签</th>
              <th class="px-3 py-2.5 font-normal">slug</th>
              <th class="px-3 py-2.5 font-normal">类型</th>
              <th class="px-3 py-2.5 font-normal">使用次数</th>
              <th class="px-3 py-2.5 font-normal">状态</th>
              <th class="px-4 py-2.5 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tags" :key="t.id" class="border-b border-line/40 last:border-b-0 hover:bg-white/[0.03]">
              <td class="px-4 py-2.5">
                <span class="inline-block h-2 w-2 rounded-full align-middle" :style="{ background: t.color }"></span>
                <span class="ml-2 text-[12px]">{{ t.name }}</span>
              </td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ t.slug }}</td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ t.type }}</td>
              <td class="px-3 py-2.5 text-[10px] text-soft">{{ t.usedCount }}</td>
              <td class="px-3 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-[9px]" :class="t.status === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-soft'">
                  {{ t.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td class="px-4 py-2.5 text-right whitespace-nowrap">
                <button class="text-[10px] text-soft transition hover:text-gold" @click="openTag(t)">编辑</button>
                <button class="ml-3 text-[10px] text-soft/60 transition hover:text-red-300" @click="removeTag(t)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 弹窗 -->
    <AdminModal :open="modalOpen" :title="editingId ? '编辑' + (tab === 'category' ? '分类' : '标签') : '新增' + (tab === 'category' ? '分类' : '标签')" @close="modalOpen = false">
      <div v-if="tab === 'category'" class="grid gap-3 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">名称 *</label>
          <input v-model="categoryForm.name" class="field" maxlength="50" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">slug</label>
          <input v-model="categoryForm.slug" class="field" maxlength="80" placeholder="留空自动生成" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">维度</label>
          <select v-model="categoryForm.type" class="field" :disabled="Boolean(editingId)">
            <option value="style">风格</option>
            <option value="scene">场景</option>
            <option value="language">语种</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">图标（emoji）</label>
          <input v-model="categoryForm.icon" class="field" maxlength="20" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">主题色</label>
          <input v-model="categoryForm.color" type="color" class="field h-10 !p-1" />
        </div>
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">简介</label>
          <textarea v-model="categoryForm.intro" class="field" rows="2" maxlength="255"></textarea>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">排序</label>
          <input v-model.number="categoryForm.sort" type="number" class="field" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">状态</label>
          <select v-model="categoryForm.status" class="field">
            <option :value="1">启用</option>
            <option :value="0">停用</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">SEO 标题</label>
          <input v-model="categoryForm.seoTitle" class="field" maxlength="200" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">SEO 描述</label>
          <input v-model="categoryForm.seoDesc" class="field" maxlength="500" />
        </div>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <div class="md:col-span-2">
          <label class="mb-1 block text-[11px] text-soft">标签名称 *</label>
          <input v-model="tagForm.name" class="field" maxlength="30" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">slug</label>
          <input v-model="tagForm.slug" class="field" maxlength="50" placeholder="留空自动生成" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">类型</label>
          <select v-model="tagForm.type" class="field">
            <option value="mood">情绪</option>
            <option value="style">风格</option>
            <option value="scene">场景</option>
            <option value="language">语种</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">颜色</label>
          <input v-model="tagForm.color" type="color" class="field h-10 !p-1" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">排序</label>
          <input v-model.number="tagForm.sort" type="number" class="field" />
        </div>
        <div>
          <label class="mb-1 block text-[11px] text-soft">状态</label>
          <select v-model="tagForm.status" class="field">
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
