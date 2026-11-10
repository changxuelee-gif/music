import { ref } from 'vue'

const STORAGE_KEY = 'fh_theme'

/** 深浅色主题（默认深色沉浸主题） */
const isDark = ref(localStorage.getItem(STORAGE_KEY) !== 'light')

function apply() {
  const html = document.documentElement
  html.classList.toggle('dark', isDark.value)
  html.classList.toggle('light', !isDark.value)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark.value ? '#06070f' : '#f3f4fa')
}

apply()

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
    apply()
  }
  return { isDark, toggle }
}
