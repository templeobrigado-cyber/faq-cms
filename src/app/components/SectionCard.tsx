import type { ArticleSection } from '../../lib/types'

interface SectionCardProps {
  /** ArticleSection オブジェクトをそのまま渡す場合 */
  section?: ArticleSection
  /** 個別 props で渡す場合（後方互換）*/
  type?: ArticleSection['type']
  title?: string
  subtitle?: string
  body_md?: string
  mediaUrl?: string
  mediaProvider?: 'youtube' | 'vimeo' | 'image'
}

const TYPE_LABELS: Record<ArticleSection['type'], string> = {
  overview:    '概要',
  analysis:    '分析',
  procedure:   '手順',
  troubleshoot:'トラブルシュート',
  note:        '注意',
  media:       'メディア',
}

const TYPE_BADGE: Record<ArticleSection['type'], string> = {
  overview:    'bg-amber-600 text-gray-900',
  analysis:    'bg-blue-600 text-white',
  procedure:   'bg-green-600 text-white',
  troubleshoot:'bg-red-600 text-white',
  note:        'bg-yellow-500 text-white',
  media:       'bg-coral-400 text-white',
}

function renderMarkdown(md: string) {
  // シンプルなMarkdown → HTML変換（箇条書き・番号リスト・太字のみ）
  const lines = md.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = (key: string) => {
    if (listItems.length === 0) return
    if (listType === 'ol') {
      elements.push(
        <ol key={key} className="list-decimal list-inside space-y-1 text-gray-800 mb-3">
          {listItems.map((li, i) => <li key={i}>{li}</li>)}
        </ol>
      )
    } else {
      elements.push(
        <ul key={key} className="space-y-2 text-gray-800 mb-3">
          {listItems.map((li, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5 shrink-0">•</span>
              <span className="break-words min-w-0">{li}</span>
            </li>
          ))}
        </ul>
      )
    }
    listItems = []
    listType = null
  }

  lines.forEach((line, i) => {
    const ulMatch = line.match(/^[-*]\s+(.+)/)
    const olMatch = line.match(/^\d+\.\s+(.+)/)

    if (ulMatch) {
      if (listType !== 'ul') { flushList(`flush-${i}`); listType = 'ul' }
      listItems.push(ulMatch[1])
    } else if (olMatch) {
      if (listType !== 'ol') { flushList(`flush-${i}`); listType = 'ol' }
      listItems.push(olMatch[1])
    } else {
      flushList(`flush-${i}`)
      if (line.trim()) {
        const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        elements.push(
          <p key={i} className="text-gray-800 leading-relaxed mb-2 break-words overflow-wrap-anywhere"
            dangerouslySetInnerHTML={{ __html: bold }} />
        )
      }
    }
  })
  flushList('final')
  return elements
}

export function SectionCard(props: SectionCardProps) {
  const sec = props.section
  const type  = (sec?.type  ?? props.type  ?? 'overview') as ArticleSection['type']
  const title = sec?.title  ?? props.title  ?? ''
  const subtitle   = sec?.subtitle   ?? props.subtitle
  const body_md    = sec?.body_md    ?? props.body_md ?? ''
  const mediaUrl   = sec?.media_url  ?? props.mediaUrl
  const mediaProvider = sec?.media_provider ?? props.mediaProvider

  const isVideo = mediaProvider === 'youtube' || mediaProvider === 'vimeo'

  const getEmbedUrl = (): string => {
    if (!mediaUrl) return ''
    if (mediaProvider === 'youtube') {
      const m = mediaUrl.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/)
      return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : ''
    }
    if (mediaProvider === 'vimeo') {
      const m = mediaUrl.match(/vimeo\.com\/(\d+)/)
      return m ? `https://player.vimeo.com/video/${m[1]}` : ''
    }
    return ''
  }

  const embedUrl = isVideo ? getEmbedUrl() : ''

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 rounded-lg p-6 border border-amber-200/50 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <span className={`inline-block px-3 py-1.5 text-xs font-medium rounded-md shadow-sm mb-4 ${TYPE_BADGE[type]}`}>
            {TYPE_LABELS[type]}
          </span>

          <h3 className="mb-3 text-gray-900">{title}</h3>

          {subtitle && (
            <h4 className="text-base font-normal text-gray-700 mb-3">{subtitle}</h4>
          )}

          {body_md && <div className="break-words">{renderMarkdown(body_md)}</div>}
        </div>

        {mediaUrl && (
          <div className="lg:w-[300px] shrink-0">
            {isVideo && embedUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : isVideo ? (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500">
                URLを認識できません
              </div>
            ) : (
              <img
                src={mediaUrl}
                alt={title}
                className="w-full min-h-[200px] object-cover rounded-lg shadow-md"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
