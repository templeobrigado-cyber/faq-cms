export type ThemeColor = 'amber' | 'blue' | 'green'

const THEME_KEY = 'faq_theme_color'

export function applyTheme(color: ThemeColor) {
  const root = document.documentElement
  root.classList.remove('theme-blue', 'theme-green')
  if (color === 'blue') root.classList.add('theme-blue')
  if (color === 'green') root.classList.add('theme-green')
  localStorage.setItem(THEME_KEY, color)
}

export function getStoredTheme(): ThemeColor {
  return (localStorage.getItem(THEME_KEY) as ThemeColor) || 'amber'
}

export function initTheme() {
  applyTheme(getStoredTheme())
}
