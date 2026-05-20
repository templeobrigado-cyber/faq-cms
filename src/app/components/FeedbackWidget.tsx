import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface FeedbackWidgetProps {
  onSubmit?: (isHelpful: boolean, comment?: string) => Promise<boolean> | void
}

export function FeedbackWidget({ onSubmit }: FeedbackWidgetProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = async (type: 'helpful' | 'not-helpful') => {
    setFeedback(type)
    if (type === 'helpful') {
      await onSubmit?.(true)
      setSubmitted(true)
    }
  }

  const handleSubmit = async () => {
    await onSubmit?.(false, comment || undefined)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-200 rounded-lg p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 text-gray-900 rounded-full mb-4">
          <ThumbsUp className="w-8 h-8" />
        </div>
        <p className="text-amber-700 font-medium text-lg">フィードバックありがとうございます</p>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
      <p className="text-center font-medium text-lg mb-6 text-gray-900">この記事は役に立ちましたか？</p>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => handleFeedback('helpful')}
          disabled={feedback !== null}
          className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-gray-900 border-2 border-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ThumbsUp className="w-5 h-5" />
          <span className="font-medium">はい</span>
        </button>
        <button
          onClick={() => handleFeedback('not-helpful')}
          disabled={feedback !== null}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ThumbsDown className="w-5 h-5" />
          <span className="font-medium">いいえ</span>
        </button>
      </div>

      {feedback === 'not-helpful' && (
        <div className="mt-6 space-y-4">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="詳しく教えていただけますか？（任意）"
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 resize-none"
          />
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            送信
          </button>
        </div>
      )}
    </div>
  )
}
