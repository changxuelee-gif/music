<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { complaintApi } from '@/api'
import { useSiteStore } from '@/stores/site'
import { useSeo } from '@/composables/useSeo'

const site = useSiteStore()
const submitting = ref(false)
const uploading = ref(false)
const error = ref('')
const ticketNo = ref('')
const fileName = ref('')

const form = reactive({
  name: '',
  contact: '',
  type: 'copyright',
  targetUrl: '',
  description: '',
  evidenceUrl: ''
})

const typeOptions = [
  { key: 'copyright', label: '版权/著作权投诉' },
  { key: 'info', label: '信息不实/错误信息' },
  { key: 'link', label: '失效或错误链接' },
  { key: 'other', label: '其他问题' }
]

useSeo({ title: '版权投诉', description: '声屿版权投诉入口，提交权属材料后我们将依法核查处理。' })

onMounted(() => site.load())

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    error.value = '材料不能超过 5MB'
    input.value = ''
    return
  }
  uploading.value = true
  error.value = ''
  try {
    const res = await complaintApi.upload(file)
    form.evidenceUrl = res.url
    fileName.value = file.name
  } catch (err: any) {
    error.value = err.message
  } finally {
    uploading.value = false
  }
}

async function submit() {
  error.value = ''
  if (!form.name.trim()) return (error.value = '请填写投诉人姓名或单位名称')
  if (!form.contact.trim()) return (error.value = '请填写联系方式')
  if (form.description.trim().length < 10) return (error.value = '请补充投诉说明（不少于 10 个字）')

  submitting.value = true
  try {
    const res = await complaintApi.submit({ ...form })
    ticketNo.value = res.ticketNo
  } catch (e: any) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="shell pt-10">
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-[11px] uppercase tracking-[0.3em] text-gold">Copyright Complaint</p>
      <h1 class="mt-3 font-display text-[32px] md:text-[40px]">版权投诉与权利声明</h1>
      <p class="mt-3 text-[13px] leading-relaxed text-soft">
        本站仅提供正版音乐平台页面的导航跳转，不存储任何音频。如认为站内信息侵犯您的合法权益，请提交以下材料，我们将依法核查处理。
      </p>
    </div>

    <!-- 成功 -->
    <div v-if="ticketNo" class="mx-auto mt-10 max-w-xl">
      <div class="glass-card grad-border p-8 text-center">
        <div class="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold-400/40 bg-gold-400/10 text-gold">
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 5 5 9-10" /></svg>
        </div>
        <h2 class="mt-5 font-display text-[22px]">投诉已提交</h2>
        <p class="mt-2 text-[12px] text-soft">工单号：<span class="text-gold">{{ ticketNo }}</span></p>
        <p class="mt-4 text-[12px] leading-relaxed text-soft">
          我们会在收到有效通知后依法处理，处理结果将通过您填写的联系方式反馈。请保留工单号以便查询。
        </p>
        <div class="mt-7 flex justify-center gap-3">
          <RouterLink to="/" class="btn-ghost text-[12px]">返回首页</RouterLink>
          <RouterLink to="/complaint" class="btn-primary text-[12px]" @click="ticketNo = ''">再提交一条</RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <!-- 表单 -->
      <form class="glass-card p-6 md:p-8" @submit.prevent="submit">
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">投诉人 / 单位 <span class="text-gold">*</span></label>
            <input v-model="form.name" class="field" maxlength="50" placeholder="姓名或公司名称" />
          </div>
          <div>
            <label class="mb-1.5 block text-[12px] text-soft">联系方式 <span class="text-gold">*</span></label>
            <input v-model="form.contact" class="field" maxlength="100" placeholder="手机号或邮箱" />
          </div>
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-[12px] text-soft">投诉类型</label>
          <select v-model="form.type" class="field">
            <option v-for="t in typeOptions" :key="t.key" :value="t.key">{{ t.label }}</option>
          </select>
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-[12px] text-soft">涉嫌侵权的页面链接</label>
          <input v-model="form.targetUrl" class="field" maxlength="500" placeholder="https://…（本站歌单或音乐人页面）" />
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-[12px] text-soft">投诉说明 <span class="text-gold">*</span></label>
          <textarea v-model="form.description" class="field min-h-[130px]" maxlength="2000" placeholder="请说明作品名称、权利归属、侵权事实与诉求。"></textarea>
          <p class="mt-1 text-[10px] text-soft/60">{{ form.description.length }} / 2000</p>
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-[12px] text-soft">权属材料（选填，支持 JPG / PNG / WEBP / PDF，≤5MB）</label>
          <label class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-[12px] text-soft transition hover:border-gold-400/40 hover:text-main">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>
            <span v-if="uploading">上传中…</span>
            <span v-else>{{ fileName || '点击上传权属证明材料' }}</span>
            <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" @change="onFile" />
          </label>
          <p v-if="form.evidenceUrl" class="mt-2 flex items-center gap-1 text-[11px] text-gold">
            ✓ 已上传
            <a :href="form.evidenceUrl" target="_blank" rel="noopener noreferrer" class="underline">查看材料</a>
          </p>
        </div>

        <p v-if="error" class="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">{{ error }}</p>

        <div class="mt-6 flex items-start gap-3 rounded-xl border border-line bg-white/[0.02] p-4 text-[11px] leading-relaxed text-soft">
          <input id="agree" type="checkbox" required class="mt-0.5 h-4 w-4 accent-[#e8c56b]" />
          <label for="agree">
            我承诺以上信息与材料真实、合法，愿承担因虚假陈述产生的法律责任，并同意本站依据《信息网络传播权保护条例》等规定处理该投诉。
          </label>
        </div>

        <button class="btn-gold mt-6 w-full" :disabled="submitting">
          {{ submitting ? '提交中…' : '提交版权投诉' }}
        </button>
      </form>

      <!-- 说明 -->
      <aside class="space-y-4">
        <div class="glass-card p-6">
          <p class="text-[11px] uppercase tracking-[0.22em] text-soft">Contact</p>
          <h3 class="mt-2 font-display text-[18px]">直接联系我们</h3>
          <div class="mt-4 space-y-3 text-[12px] leading-relaxed text-soft">
            <p>运营主体：<span class="text-main">{{ site.config?.companyName || '凤凰爱听（北京）信息技术有限公司' }}</span></p>
            <p>投诉邮箱：<a :href="`mailto:${site.config?.complaintEmail || 'copyright.com'}`" class="text-gold">{{ site.config?.complaintEmail || 'copyright.com' }}</a></p>
            <p>投诉电话：<span class="text-main">{{ site.config?.complaintPhone || '010-8888 6666' }}</span></p>
            <p>网络文化经营许可证：<span class="text-main">{{ site.config?.wenwangwenNo || '京网文〔2023〕3019-099号' }}</span></p>
            <p>ICP 备案号：<span class="text-main">{{ site.config?.icpNo || '京B2-20213133' }}</span></p>
          </div>
        </div>

        <div class="glass-card p-6">
          <h3 class="font-display text-[16px]">处理流程</h3>
          <ol class="mt-4 space-y-3 text-[12px] leading-relaxed text-soft">
            <li><span class="text-gold">01</span> 提交工单与权属材料</li>
            <li><span class="text-gold">02</span> 法务/内容审核员核查（1-3 个工作日）</li>
            <li><span class="text-gold">03</span> 视核查结果下架相关内容或更正信息</li>
            <li><span class="text-gold">04</span> 通过您预留的联系方式反馈结果</li>
          </ol>
        </div>

        <p class="px-2 text-[10px] leading-relaxed text-soft/60">
          提示：本站不提供任何音频文件，若投诉涉及第三方平台的音源，请直接向该平台主张权利。
        </p>
      </aside>
    </div>
  </div>
</template>
