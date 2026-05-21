import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { AuthProvider } from '../lib/auth'
import { initTheme } from '../lib/theme'
import { initFont } from '../lib/font'
import { initRadius } from '../lib/radius'
import { getSettings } from '../lib/services/settings'
import { TopPage } from './components/pages/TopPage'
import { CategoryDetailPage } from './components/pages/CategoryDetailPage'
import { ArticleDetailPage } from './components/pages/ArticleDetailPage'
import { SearchResultPage } from './components/pages/SearchResultPage'
import { ContactPage } from './components/pages/ContactPage'
import { NotFoundPage } from './components/pages/NotFoundPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { LoginPage } from './components/admin/pages/LoginPage'

export default function App() {
  useEffect(() => {
    initTheme(); initFont(); initRadius()
    // ファビコンを動的に適用
    getSettings().then(s => {
      if (s.site_favicon_url) {
        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") ?? document.createElement('link')
        link.type = 'image/x-icon'
        link.rel = 'icon'
        link.href = s.site_favicon_url
        document.head.appendChild(link)
      }
    })
  }, [])

  return (
    <AuthProvider>
    <Routes>
      {/* 公開サイト */}
      <Route path="/" element={<TopPage />} />
      <Route path="/search" element={<SearchResultPage />} />
      <Route path="/category/:slug" element={<CategoryDetailPage />} />
      <Route path="/article/:slug" element={<ArticleDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* 管理画面 */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/*" element={<AdminLayout />} />

      {/* フォールバック */}
      <Route path="/404" element={<NotFoundPage type="404" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </AuthProvider>
  )
}
