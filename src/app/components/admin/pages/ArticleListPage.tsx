import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, Edit, Eye, Trash2, X, AlertTriangle } from 'lucide-react'
import { getAllArticles, deleteArticle } from '../../../../lib/services/articles'
import { useAuth } from '../../../../lib/auth'
import type { Article } from '../../../../lib/types'

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  published:   { label: '公開中',    className: 'bg-green-100 text-green-700' },
  draft:       { label: '下書き',    className: 'bg-gray-100 text-gray-600' },
  review:      { label: 'レビュー中', className: 'bg-yellow-100 text-yellow-700' },
  unpublished: { label: '非公開',    className: 'bg-red-100 text-red-600' },
}

export function ArticleListPage() {
  const navigate = useNavigate()
  const { can } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [filtered, setFiltered] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllArticles().then(data => {
      setArticles(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = articles
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(a => a.title.toLowerCase().includes(q))
    }
    if (statusFilter) {
      result = result.filter(a => a.status === statusFilter)
    }
    setFiltered(result)
  }, [searchQuery, statusFilter, articles])

  const handleDelete = async (id: string) => {
    const ok = await deleteArticle(id)
    if (ok) setArticles(prev => prev.filter(a => a.id !== id))
    setDeleteConfirmId(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-gray-900">記事一覧</h1>
        <button
          onClick={() => navigate('/admin/articles/new')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="記事を検索…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem 1rem' }}
        >
          <option value="">すべてのステータス</option>
          <option value="published">公開中</option>
          <option value="draft">下書き</option>
          <option value="review">レビュー中</option>
          <option value="unpublished">非公開</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-500">読み込み中…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">タイトル</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">カテゴリ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">タグ</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">ステータス</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">閲覧数</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">更新日</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(article => {
                const st = STATUS_LABEL[article.status] ?? STATUS_LABEL.draft
                return (
                  <tr
                    key={article.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-amber-600"
                        onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                      >
                        {article.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.category?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(article.tags ?? []).slice(0, 3).map(tag => (
                          <span
                            key={tag.id}
                            className="inline-block px-2 py-0.5 rounded text-xs text-white font-medium"
                            style={{ backgroundColor: tag.color ?? '#6B7280' }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {(article.tags ?? []).length > 3 && (
                          <span className="text-xs text-gray-400">+{article.tags!.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{article.view_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {article.updated_at.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                          title="プレビュー"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/articles/${article.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 rounded"
                          title="編集"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {can('article.delete') && (
                          <button
                            onClick={() => setDeleteConfirmId(article.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    記事が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 削除確認モーダル */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-medium text-gray-900">記事を削除しますか？</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">この操作は取り消せません。</p>
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
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
