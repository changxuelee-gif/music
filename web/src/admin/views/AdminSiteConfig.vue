<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { adminApi } from '@/api'
import { useAdminStore } from '@/stores/admin'

const admin = useAdminStore()
const rows = ref<any[]>([])
const values = ref<Record<string, string>>({})
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const toast = ref('')

const groups = [
  { title: '站点 SEO', keys: ['site_name', 'site_slogan', 'site_keywords', 'site_description'] },
  { title: '资质与联系信息', keys: ['company_name', 'wenwangwen_no', 'icp_no', 'complaint_email', 'complaint_phone'] },
  { title: '法律文本', keys: ['disclaimer', 'privacy_policy'] },
  { title: '搜索运营', keys: ['hot_search_words'] },
  { title: '三方统计代码', keys: ['analytics_code'] }
]

const labels: Record<string, { label: string; hint?: string; long?: boolean; required?: boolean }> = {
  site_name: { label: '站点名称' },
  site_slogan: { label: 'Slogan' },
  site_keywords: { label: 'SEO 关键词', hint: '英文逗号分隔' },
  site_description: { label: '站点描述', long: true },
  company_name: { label: '运营主体公司', required: true, hint: '页脚固定展示，不能为空' },
  wenwangwen_no: { label: '网络文化经营许可证号', required: true, hint: '合规资质，不能为空' },
  icp_no: { label: 'ICP 备案号', required: true, hint: '合规资质，不能为空' },
  complaint_email: { label: '投诉邮箱' },
  complaint_phone: { label: '投诉电话' },
  disclaimer: { label: '免责声明', long: true },
  privacy_policy: { label: '隐私政策', long: true },
  hot_search_words: { label: '热门搜索词', hint: '英文逗号分隔，用于搜索页展示' },
  analytics_code: { label: '统计代码', long: true, hint: '粘贴 Google Analytics / 百度统计 / CNZZ 等完整 <script> 代码，留空不启用' }
}

const totalRows = computed(() => rows.value.length)

onMounted(async () => {
  try {
    const list = await adminApi.siteConfig()
    rows.value = list
    const map: Record<string, string> = {}
    list.forEach((r: any) => { map[r.key] = r.value })
    values.value = map
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 2400)
}

async function save() {
  error.value = ''
  for (const key of ['company_name', 'wenwangwen_no', 'icp_no']) {
    if (!values.value[key]?.trim()) {
      error.value = '资质信息（公司主体 / 文网文号 / ICP 备案号）不允许清空'
      return
    }
  }
  saving.value = true
  try {
    const items = rows.value
      .filter((r) => Object.prototype.hasOwnProperty.call(values.value, r.key))
      .map((r) => ({ key: r.key, value: values.value[r.key] ?? '' }))
    await adminApi.saveSiteConfig(items)
    showToast('站点配置已保存')
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="font-display text-[20px]">站点配置</h2>
        <p class="mt-1 text-[11px] text-soft">SEO 文案、资质信息与法律文本；资质项为合规固定展示，请勿清空。</p>
      </div>
      <button class="btn-primary text-[12px]" :disabled="saving || !admin.isAdmin" @click="save">
        {{ saving ? '保存中…' : '保存配置' }}
      </button>
    </div>

    <div v-if="!admin.isAdmin" class="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-[11px] text-amber-200">
      当前账号为审核员，站点配置仅管理员可修改（接口层同样限制）。
    </div>

    <div v-if="loading" class="mt-5 h-64 animate-pulse rounded-2xl border border-line bg-white/[0.03]"></div>

    <div v-else class="mt-5 grid gap-5 xl:grid-cols-2">
      <section v-for="g in groups" :key="g.title" class="glass-card p-5" :class="g.title === '法律文本' ? 'xl:col-span-2' : ''">
        <h3 class="font-display text-[15px]">{{ g.title }}</h3>
        <div class="mt-4 space-y-3">
          <div v-for="key in g.keys" :key="key">
            <label class="mb-1 flex items-center gap-1.5 text-[11px] text-soft">
              {{ labels[key]?.label || key }}
              <span v-if="labels[key]?.required" class="text-gold">*</span>
              <span v-if="labels[key]?.hint" class="text-[9px] text-soft/50">（{{ labels[key]?.hint }}）</span>
            </label>
            <textarea
              v-if="labels[key]?.long"
              v-model="values[key]"
              class="field text-[11px] leading-relaxed"
              :rows="key === 'privacy_policy' ? 7 : key === 'analytics_code' ? 8 : 5"
            ></textarea>
            <input v-else v-model="values[key]" class="field !h-9 text-[11px]" />
          </div>
        </div>
      </section>
    </div>

    <div v-if="error" class="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">{{ error }}</div>

    <p class="mt-5 rounded-xl border border-gold-400/25 bg-gold-400/5 px-4 py-3 text-[10px] leading-relaxed text-gold/80">
      合规提醒：页脚必须展示「{{ values.company_name }}」、文网文号「{{ values.wenwangwen_no }}」与 ICP「{{ values.icp_no }}」；
      本站不得出现任何音频播放能力。配置项共 {{ totalRows }} 条，仅白名单键可写入。
    </p>

    <Transition name="fade">
      <div v-if="toast" class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line-strong bg-elevated/95 px-5 py-2.5 text-[12px] shadow-xl">{{ toast }}</div>
    </Transition>
  </div>
</template>
