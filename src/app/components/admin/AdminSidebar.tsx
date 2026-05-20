import { NavLink, useNavigate } from 'react-router'
import {
  LayoutDashboard, FileText, FolderOpen, Tags,
  SearchX, BarChart3, MessageSquare, Users, Settings, ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../../lib/auth'
import type { Action } from '../../../lib/auth'

type MenuItem = {
  path: string
  icon: React.ElementType
  label: string
  requiredAction?: Action
}

const menuItems: MenuItem[] = [
  { path: '/admin/dashboard',   icon: LayoutDashboard, label: 'ダッシュボード' },
  { path: '/admin/articles',    icon: FileText,        label: '記事一覧' },
  { path: '/admin/categories',  icon: FolderOpen,      label: 'カテゴリ管理',  requiredAction: 'category.manage' },
  { path: '/admin/tags',        icon: Tags,            label: 'タグ管理',      requiredAction: 'tag.manage' },
  { path: '/admin/zero-hits',   icon: SearchX,         label: '未解決の検索' },
  { path: '/admin/analytics',   icon: BarChart3,       label: '分析' },
  { path: '/admin/feedback',    icon: MessageSquare,   label: 'フィードバック' },
  { path: '/admin/users',       icon: Users,           label: 'ユーザー管理',  requiredAction: 'user.manage' },
  { path: '/admin/settings',    icon: Settings,        label: '設定',          requiredAction: 'settings.manage' },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const { can } = useAuth()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">FAQ-CMS</h1>
        <p className="text-xs text-gray-400 mt-1">管理画面</p>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        {menuItems
          .filter(item => !item.requiredAction || can(item.requiredAction))
          .map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `w-full px-6 py-3 flex items-center gap-3 transition-all border-l-4 ${
                  isActive
                    ? 'bg-gray-800 border-amber-400 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
      </nav>

      <div className="px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-3 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          公開サイトへ戻る
        </button>
      </div>

      <div className="p-6 border-t border-gray-800">
        <p className="text-xs text-gray-500">© 2026 XXXXXX</p>
        <p className="text-xs text-gray-500 mt-1">v1.0.0</p>
      </div>
    </aside>
  )
}
