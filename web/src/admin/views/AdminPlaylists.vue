<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/api'
import type { Paged } from '@/types'

const data = ref<Paged<any> | null>(null)
const loading = ref(false)
const keyword = ref('')
const status = ref('')
const page = ref(1)
const toast = ref('')
const busyId = ref<number | null>(null)

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => Boolean(data.value && page.value < data.value.totalPages))

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function load() {
  loading.value = true
  try {
    data.value = await adminApi.playlists({
      page: page.value,
      pageSize: 12,
      keyword: keyword.value || undefined,
      status: status.value === '' ? undefined : status.value
    })
  } catch (e: any) {
    showToast(e.message)
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  load()
}

async function toggleStatus(p: any) {
  busyId.value = p.id
  try {
    await adminApi.playlistStatus(p.id, p.status === 1 ? 0 : 1)
    p.status = p.status === 1 ? 0 : 1
    showToast(p.status === 1 ? '已上架' : '已下架')
  } catch (e: any) {
    showToast(e.message)
  } finally {
    busyId.value = null
  }
}

async function remove(p: any) {
  if (!window.confirm(`确定删除歌单「${p.title}」？删除后不可恢复，关联歌曲条目将一并移除。`)) return
  busyId.value = p.id
  try {
    await adminApi.deletePlaylist(p.id)
    showToast('已删除')
    load()
  } catch (e: any) {
    showToast(e.message)
  } finally {
    busyId.value = null
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
        <h2 class="font-display text-[20px]">歌单管理</h2>
        <p class="mt-1 text-[11px] text-soft">歌单由编辑人工录入，歌曲条目仅保存正版平台跳转链接。</p>
      </div>
      <RouterLink to="/admin/playlists/new" class="btn-primary text-[12px]">
        + 新建歌单
      </RouterLink>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-white/[0.02] p-3">
      <input v-model="keyword" class="field !h-9 !w-56 text-[12px]" placeholder="搜索标题或 slug" @keyup.enter="search" />
      <select v-model="status" class="field !h-9 !w-32 text-[12px]" @change="search">
        <option value="">全部状态</option>
        <option value="1">已上架</option>
        <option value="0">已下架</option>
      </select>
      <button class="btn-ghost !py-2 text-[12px]" @click="search">查询</button>
      <button class="text-[11px] text-soft/70 transition hover:text-gold" @click="keyword = ''; status = ''; search()">重置</button>
      <span class="ml-auto text-[11px] text-soft">共 {{ data?.total || 0 }} 个歌单</span>
    </div>

    <div class="mt-4 overflow-hidden rounded-xl border border-line bg-white/[0.02]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left">
          <thead>
            <tr class="border-b border-line text-[10px] uppercase tracking-wide text-soft/60">
              <th class="px-4 py-3 font-normal">歌单</th>
              <th class="px-3 py-3 font-normal">分类</th>
              <th class="px-3 py-3 font-normal">曲目</th>
              <th class="px-3 py-3 font-normal">数据</th>
              <th class="px-3 py-3 font-normal">标记</th>
              <th class="px-3 py-3 font-normal">状态</th>
              <th class="px-4 py-3 text-right font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-10 text-center text-[12px] text-soft">加载中…</td>
            </tr>
            <tr v-else-if="!data?.list.length">
              <td colspan="7" class="px-4 py-10 text-center text-[12px] text-soft">暂无歌单，点击右上角新建。</td>
            </tr>
            <tr v-for="p in data?.list" :key="p.id" class="border-b border-line/60 last:border-b-0 hover:bg-white/[0.03]">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="p.cover" class="h-11 w-11 rounded-lg object-cover" />
                  <div class="min-w-0">
                    <p class="max-w-[220px] truncate text-[12px]">{{ p.title }}</p>
                    <p class="mt-0.5 text-[10px] text-soft/60">/{{ p.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 text-[11px] text-soft">
                <p>{{ p.categoryName || '—' }}</p>
                <p class="mt-0.5 text-[10px] text-soft/50">{{ p.sceneName }} · {{ p.languageName }}</p>
              </td>
              <td class="px-3 py-3 text-[11px] text-soft">{{ p.songCount }}</td>
              <td class="px-3 py-3 text-[10px] text-soft">
                <p>浏览 {{ p.viewCount }}</p>
                <p class="mt-0.5">跳转 {{ p.clickCount }}</p>
              </td>
              <td class="px-3 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-if="p.isFeatured" class="rounded border border-gold-400/30 px-1.5 py-0.5 text-[9px] text-gold">精</span>
                  <span v-if="p.isHot" class="rounded border border-indigo-400/30 px-1.5 py-0.5 text-[9px] text-indigo-300">热</span>
                  <span v-if="p.isNew" class="rounded border border-violet-400/30 px-1.5 py-0.5 text-[9px] text-violet-300">新</span>
                </div>
              </td>
              <td class="px-3 py-3">
                <span class="rounded-full px-2 py-0.5 text-[10px]" :class="p.status === 1 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-soft'">
                  {{ p.status === 1 ? '已上架' : '已下架' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <RouterLink :to="`/admin/playlists/${p.id}/edit`" class="text-[11px] text-soft transition hover:text-gold">编辑</RouterLink>
                <button class="ml-3 text-[11px] text-soft transition hover:text-gold" :disabled="busyId === p.id" @click="toggleStatus(p)">
                  {{ p.status === 1 ? '下架' : '上架' }}
                </button>
                <button class="ml-3 text-[11px] text-soft/60 transition hover:text-red-300" :disabled="busyId === p.id" @click="remove(p)">删除</button>
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

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">{{ toast }}</div>
    </Transition>
  </div>
</template>
