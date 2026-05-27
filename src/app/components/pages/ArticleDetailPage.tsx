import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { Breadcrumbs } from '../Breadcrumbs'
import { SectionCard } from '../SectionCard'
import { FeedbackWidget } from '../FeedbackWidget'
import { getArticleBySlug, incrementViewCount } from '../../../lib/services/articles'
import { submitFeedback } from '../../../lib/services/feedback'
import type { Article } from '../../../lib/types'

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getArticleBySlug(slug).then(data => {
      if (!data) { navigate('/404', { replace: true }); return }
      setArticle(data)
      setLoading(false)

      const key = `viewed_${data.id}`
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        incrementViewCount(data.id)
      }
    })
  }, [slug, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">読み込み中…</p>
      </div>
    )
  }

  if (!article) return null

  const breadcrumbs = [
    { label: 'ホーム', href: '/' },
    ...(article.category
      ? [{ label: article.category.name, href: `/category/${article.category.slug}` }]
      : []),
    { label: article.title },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        variant="compact"
        onBack={() => navigate(-1)}
        onSearch={q => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />

      <main className="flex-1 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-12">
          <Breadcrumbs items={breadcrumbs} />

          <article className="mt-8">
            <div className="mb-12">
              <h1 className="mb-5 text-gray-900">{article.title}</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">{article.lead}</p>

              {article.sections && article.sections.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-200 rounded-lg p-6">
                  <h4 className="mb-4 text-amber-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-600 rounded-full" />
                    この記事の内容：
                  </h4>
                  <ul className="space-y-3 text-gray-800">
                    {article.sections.map(s => (
                      <li key={s.id} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>{s.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* セクションカード */}
            <div className="space-y-6">
              {article.sections?.map(section => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>

            {/* タグ */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-200 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-500">タグ：</span>
                {article.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-3 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color ?? '#6B7280' }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </article>

          <div className="mt-16">
            <FeedbackWidget
              articleTitle={article.title}
              onSubmit={(isHelpful, comment) =>
                submitFeedback(article.id, isHelpful, comment)
              }
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
