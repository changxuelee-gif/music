<script setup lang="ts">
defineProps<{ open: boolean; title: string; wide?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10 backdrop-blur-sm" @click.self="emit('close')">
        <div class="w-full rounded-2xl border border-line-strong bg-elevated shadow-2xl" :class="wide ? 'max-w-3xl' : 'max-w-lg'">
          <div class="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 class="font-display text-[18px]">{{ title }}</h3>
            <button class="btn-icon h-8 w-8" @click="emit('close')" aria-label="关闭">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <div class="max-h-[75vh] overflow-y-auto px-6 py-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
