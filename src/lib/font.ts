export type FontKey = 'noto-sans-jp' | 'm-plus-rounded' | 'noto-serif-jp' | 'mochiy-pop'

const FONT_STORAGE_KEY = 'faq_font_key'

export const FONT_OPTIONS: { key: FontKey; label: string; family: string; googleQuery: string | null }[] = [
  {
    key: 'noto-sans-jp',
    label: 'Noto Sans JP',
    family: '"Noto Sans JP", sans-serif',
    googleQuery: null, // fonts.cssで既にロード済み
  },
  {
    key: 'm-plus-rounded',
    label: 'M PLUS Rounded 1c',
    family: '"M PLUS Rounded 1c", sans-serif',
    googleQuery: 'M+PLUS+Rounded+1c:wght@400;500;700;900',
  },
  {
    key: 'noto-serif-jp',
    label: 'Noto Serif JP',
    family: '"Noto Serif JP", serif',
    googleQuery: 'Noto+Serif+JP:wght@400;500;700;900',
  },
  {
    key: 'mochiy-pop',
    label: 'Mochiy Pop One',
    family: '"Mochiy Pop One", sans-serif',
    googleQuery: 'Mochiy+Pop+One',
  },
]

function loadGoogleFont(option: typeof FONT_OPTIONS[number]) {
  if (!option.googleQuery) return
  const linkId = `gfont-${option.key}`
  if (document.getElementById(linkId)) return
  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${option.googleQuery}&display=swap`
  document.head.appendChild(link)
}

export function applyFont(key: FontKey) {
  const option = FONT_OPTIONS.find(f => f.key === key)
  if (!option) return
  loadGoogleFont(option)
  document.documentElement.style.setProperty('--font-family-base', option.family)
  localStorage.setItem(FONT_STORAGE_KEY, key)
}

export function getStoredFont(): FontKey {
  return (localStorage.getItem(FONT_STORAGE_KEY) as FontKey) || 'noto-sans-jp'
}

export function initFont() {
  applyFont(getStoredFont())
}
