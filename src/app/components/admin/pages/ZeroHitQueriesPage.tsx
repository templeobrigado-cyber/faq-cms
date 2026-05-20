import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, FileText, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { getZeroHitQueries } from '../../../../lib/services/search'

type QueryStatus = 'pending' | 'resolved' | 'ignored'

interface QueryRow {
  query: string
  count: number
  last_searched_at: string
  status: QueryStatus
}

const STATUS_KEY = 'faq_zero_hit_status'

function loadStatuses(): Record<string, QueryStatus> {
  try { return JSON.parse(localStorage.getItem(STATUS_KEY) ?? '{}') } catch { return {} }
}

function saveStatuses(map: Record<string, QueryStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(map))
}

export function ZeroHitQueriesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<QueryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | QueryStatus>('all')
  const [sortBy, setSortBy] = useState<'count' | 'date'>('count')

  useEffect(() => {
    getZeroHitQueries(100).then(data => {
      const statuses = loadStatuses()
      setRows(data.map(d => ({
        ...d,
        status: statuses[d.query] ?? 'pending',
      })))
      setLoading(false)
    })
  }, [])

  const updateStatus = (query: string, status: QueryStatus) => {
    const statuses = loadStatuses()
    statuses[query] = status
    saveStatuses(statuses)
    setRows(prev => prev.map(r => r.query === query ? { ...r, status } : r))
  }

  const filtered = rows
    .filter(r => {
      const matchSearch = r.query.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) =>
      sortBy === 'count'
        ? b.count - a.count
        : new Date(b.last_searched_at).getTime() - new Date(a.last_searched_at).getTime()
    )

  const total    = rows.length
  const pending  = rows.filter(r => r.status === 'pending').length
  const resolved = rows.filter(r => r.status === 'resolved').length
  const ignored  = rows.filter(r => r.status === 'ignored').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">未解決の検索</h1>
        <p className="text-sm text-gray-600">検索結果が0件だったキーワードの一覧。記事を作成することでユーザーの疑問に答えられます。</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">総クエリ数</p>
          <p className="text-2xl font-medium text-gray-900">{total}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">未対応</p>
          <p className="text-2xl font-medium text-amber-800">{pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">対応済み</p>
          <p className="text-2xl font-medium text-green-800">{resolved}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">無視</p>
          <p className="text-2xl font-medium text-gray-700">{ignored}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="キーワードで絞り込み…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem 1rem' }}
        >
          <option value="all">すべてのステータス</option>
          <option value="pending">未対応</option>
          <option value="resolved">対応済み</option>
          <option value="ignored">無視</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem 1rem' }}
        >
          <option value="count">検索回数（多い順）</option>
          <option value="date">最終検索日（新しい順）</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">検索キーワード</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-600">検索回数</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">最終検索日</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.query} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{row.query}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                      {row.count}回
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {row.last_searched_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />未対応
                      </span>
                    )}
                    {row.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />対応済み
                      </span>
                    )}
                    {row.status === 'ignored' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        <EyeOff className="w-3 h-3" />無視
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {row.status === 'pending' && (
                        <>
                          <button
                            onClick={() => navigate(`/admin/articles/new?title=${encodeURIComponent(row.query)}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-gray-900 rounded text-xs hover:bg-amber-700 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            記事化
                          </button>
                          <button
                            onClick={() => updateStatus(row.query, 'resolved')}
                            className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            対応済み
                          </button>
                          <button
                            onClick={() => updateStatus(row.query, 'ignored')}
                            className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            無視
                          </button>
                        </>
                      )}
                      {(row.status === 'resolved' || row.status === 'ignored') && (
                        <button
                          onClick={() => updateStatus(row.query, 'pending')}
                          className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          未対応に戻す
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                    {loading ? '読み込み中…' : 'データがありません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
            {filtered.length} 件を表示中（全 {total} 件）
          </div>
        </div>
      )}
    </div>
  )
}
