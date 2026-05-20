import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { FileText, Eye, ThumbsUp, AlertCircle } from 'lucide-react'
import { getDashboardStats } from '../../../../lib/services/dashboard'
import { getFeedbacks } from '../../../../lib/services/feedback'
import { getZeroHitQueries } from '../../../../lib/services/search'
import type { DashboardStats } from '../../../../lib/services/dashboard'
import type { Feedback } from '../../../../lib/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [zeroHits, setZeroHits] = useState<Array<{ query: string; count: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getFeedbacks(),
      getZeroHitQueries(5),
    ]).then(([s, fb, zh]) => {
      setStats(s)
      setFeedbacks(fb.slice(0, 5))
      setZeroHits(zh)
      setLoading(false)
    })
  }, [])

  const kpis = stats ? [
    {
      label: '総記事数',
      value: stats.totalArticles.toLocaleString(),
      sub: `公開中 ${stats.publishedArticles}件`,
      icon: FileText,
      color: 'amber',
    },
    {
      label: '公開記事',
      value: stats.publishedArticles.toLocaleString(),
      sub: `全体の ${stats.totalArticles > 0 ? Math.round(stats.publishedArticles / stats.totalArticles * 100) : 0}%`,
      icon: Eye,
      color: 'blue',
    },
    {
      label: '総閲覧数',
      value: stats.totalViews.toLocaleString(),
      sub: '全記事合計',
      icon: Eye,
      color: 'green',
    },
    {
      label: '解決率',
      value: stats.helpfulRate !== null ? `${stats.helpfulRate}%` : '—',
      sub: 'フィードバック',
      icon: ThumbsUp,
      color: 'purple',
    },
  ] : []

  const colorMap: Record<string, { bg: string; icon: string }> = {
    amber:  { bg: 'bg-amber-100',  icon: 'text-amber-600' },
    blue:   { bg: 'bg-blue-100',   icon: 'text-blue-600' },
    green:  { bg: 'bg-green-100',  icon: 'text-green-600' },
    purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-1">ダッシュボード</h1>
        <p className="text-sm text-gray-600">FAQサイトの概要と主要指標</p>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">読み込み中…</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon
              const c = colorMap[kpi.color]
              return (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-amber-400 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${c.bg}`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
                  <p className="text-3xl font-medium text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-xs text-gray-500">{kpi.sub}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Feedback */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-medium text-gray-900">最新のフィードバック</h2>
                <button
                  onClick={() => navigate('/admin/feedback')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  すべて見る →
                </button>
              </div>
              {feedbacks.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500 text-center">フィードバックはまだありません</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {feedbacks.map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          item.is_helpful ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <ThumbsUp className={`w-4 h-4 ${
                            item.is_helpful ? 'text-green-600' : 'text-red-600 rotate-180'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.article?.title ?? '記事不明'}
                          </p>
                          {item.comment && (
                            <p className="text-sm text-gray-600 mt-0.5">「{item.comment}」</p>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zero Hit Queries */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="font-medium text-gray-900">ヒット0クエリ Top5</h2>
                <button
                  onClick={() => navigate('/admin/zero-hits')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  すべて見る →
                </button>
              </div>
              {zeroHits.length === 0 ? (
                <p className="px-6 py-8 text-sm text-gray-500 text-center">ヒット0クエリはありません</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {zeroHits.map((item, i) => (
                    <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-100 rounded">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-900">{item.query}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{item.count}回</span>
                        <button
                          onClick={() => navigate(`/admin/articles/new?q=${encodeURIComponent(item.query)}`)}
                          className="px-3 py-1 bg-amber-600 text-gray-900 text-xs rounded hover:bg-amber-700 transition-colors"
                        >
                          記事化
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
