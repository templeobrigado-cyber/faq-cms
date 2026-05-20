import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Loader2, User } from 'lucide-react'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../../../../lib/services/users'
import { useAuth } from '../../../../lib/auth'
import { AccessDenied } from '../AccessDenied'
import type { AdminUser, UserRole } from '../../../../lib/types'

const ROLE_LABEL: Record<UserRole, { label: string; className: string }> = {
  admin:  { label: '管理者',    className: 'bg-amber-100 text-amber-800' },
  editor: { label: '編集者',    className: 'bg-blue-100 text-blue-700' },
  viewer: { label: '閲覧のみ', className: 'bg-gray-100 text-gray-600' },
}

export function UserManagementPage() {
  const { can } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // フォーム
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formRole, setFormRole] = useState<UserRole>('editor')
  const [formActive, setFormActive] = useState(true)

  const load = () => {
    setLoading(true)
    getAdminUsers().then(data => {
      setUsers(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditingId(null)
    setFormName('')
    setFormEmail('')
    setFormRole('editor')
    setFormActive(true)
    setShowPanel(true)
  }

  const openEdit = (user: AdminUser) => {
    setEditingId(user.id)
    setFormName(user.display_name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormActive(user.is_active)
    setShowPanel(true)
  }

  const handleClose = () => {
    setShowPanel(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) return
    setSaving(true)
    const input = { display_name: formName.trim(), email: formEmail.trim(), role: formRole, is_active: formActive }
    if (editingId) {
      await updateAdminUser(editingId, input)
    } else {
      await createAdminUser(input)
    }
    load()
    handleClose()
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await deleteAdminUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteConfirmId(null)
  }

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!can('user.manage')) return <AccessDenied />

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-gray-900">ユーザー管理</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          ユーザーを追加
        </button>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className={showPanel ? 'flex-1' : 'w-full'}>
          {/* Search */}
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="名前・メールで検索…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">読み込み中…</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">名前</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">メールアドレス</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">権限</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">ステータス</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">登録日</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const role = ROLE_LABEL[user.role]
                    return (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{user.display_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${role.className}`}>
                            {role.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {user.is_active ? '有効' : '無効'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.created_at.slice(0, 10)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(user)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(user.id)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                        ユーザーが見つかりません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
              全 {filtered.length} 件
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        {showPanel && (
          <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm shrink-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">{editingId ? 'ユーザーを編集' : 'ユーザーを追加'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="例：山田太郎"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* メール */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="例：yamada@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* 権限 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">権限</label>
                <div className="space-y-2">
                  {(['admin', 'editor', 'viewer'] as UserRole[]).map(role => (
                    <label key={role} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formRole === role}
                        onChange={() => setFormRole(role)}
                        className="mt-0.5 text-amber-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ROLE_LABEL[role].label}</p>
                        <p className="text-xs text-gray-500">
                          {role === 'admin' && '全機能の操作・設定変更が可能'}
                          {role === 'editor' && '記事の作成・編集・公開が可能'}
                          {role === 'viewer' && '閲覧のみ、編集不可'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">ステータス</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="text-amber-600 rounded"
                  />
                  <span className="text-sm text-gray-700">有効（ログイン可能）</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim() || !formEmail.trim()}
                className="px-4 py-2 bg-amber-600 text-gray-900 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? '更新' : '追加'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 削除確認 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <h3 className="font-medium text-gray-900">ユーザーを削除しますか？</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">この操作は取り消せません。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
