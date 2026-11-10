<script setup lang="ts">
/**
 * 背景装饰：柔光星尘粒子 + 极光光晕
 * 纯 Canvas 视觉动效，不包含任何音频能力
 */
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0
let resizeHandler: (() => void) | null = null

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let width = 0
  let height = 0
  let dpr = 1

  interface Particle { x: number; y: number; vx: number; vy: number; r: number; alpha: number; hue: string }
  let particles: Particle[] = []

  const colors = ['255,255,255', '160,180,255', '210,190,255', '232,197,107']

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = window.innerWidth
    height = window.innerHeight
    el.width = width * dpr
    el.height = height * dpr
    el.style.width = `${width}px`
    el.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const count = Math.min(90, Math.floor((width * height) / 22000))
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.5 + 0.15,
      hue: colors[Math.floor(Math.random() * colors.length)]
    }))
  }

  function draw() {
    ctx.clearRect(0, 0, width, height)

    for (const p of particles) {
      if (!reduceMotion) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20
      }
      ctx.beginPath()
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }

    // 近邻连线：形成极淡的星图
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i]
        const b = particles[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist2 = dx * dx + dy * dy
        if (dist2 < 140 * 140) {
          const alpha = (1 - Math.sqrt(dist2) / 140) * 0.12
          ctx.strokeStyle = `rgba(120,140,255,${alpha})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    if (!reduceMotion) raf = requestAnimationFrame(draw)
  }

  resize()
  draw()
  resizeHandler = resize
  window.addEventListener('resize', resizeHandler)
  if (reduceMotion) window.addEventListener('resize', draw)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div class="absolute inset-0 bg-base"></div>
    <canvas ref="canvas" class="absolute inset-0 opacity-70"></canvas>
    <!-- 极光光晕 -->
    <div class="aurora -left-40 top-[-10%] h-[520px] w-[520px]" style="background: radial-gradient(circle, rgba(91,108,255,.5), transparent 65%)"></div>
    <div class="aurora right-[-10%] top-[18%] h-[620px] w-[620px]" style="background: radial-gradient(circle, rgba(124,92,255,.42), transparent 65%)"></div>
    <div class="aurora bottom-[-20%] left-[28%] h-[520px] w-[520px]" style="background: radial-gradient(circle, rgba(232,197,107,.18), transparent 65%)"></div>
    <!-- 顶部细网格 -->
    <div
      class="absolute inset-x-0 top-0 h-[60vh] opacity-[0.18]"
      style="background-image: linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px); background-size: 80px 80px; mask-image: linear-gradient(to bottom, black, transparent 80%); -webkit-mask-image: linear-gradient(to bottom, black, transparent 80%);"
    ></div>
    <!-- 底部装饰音频波形（仅视觉） -->
    <div class="absolute bottom-10 right-8 hidden items-end gap-[3px] opacity-40 md:flex">
      <span v-for="i in 18" :key="i" class="wave-bar" :style="{ height: `${14 + (i % 6) * 6}px`, animationDelay: `${i * 0.08}s` }"></span>
    </div>
  </div>
</template>
