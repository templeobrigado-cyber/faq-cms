import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../../../lib/auth'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

const DEMO_EMAIL = 'admin@faq-cms.example.com'
const DEMO_PASSWORD = 'admin123'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      // Supabaseのadmin_userテーブルからロールを取得（なければadmin）
      let role: 'admin' | 'editor' | 'viewer' = 'admin'
      let displayName = '管理者'
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('admin_user')
          .select('role, display_name')
          .eq('email', email)
          .single()
        if (data) {
          role = data.role as typeof role
          displayName = data.display_name
        }
      }
      login(email, role, displayName)
      navigate('/admin/dashboard', { replace: true })
    } else {
      setError('メールアドレスまたはパスワードが正しくありません')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">FAQ-CMS</h1>
          <p className="text-gray-600">管理画面ログイン</p>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-8">
          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email" id="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
                  placeholder={DEMO_EMAIL}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                パスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} id="password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 border-2 border-gray-300 rounded" />
                <span className="text-sm text-gray-700">ログイン状態を保持</span>
              </label>
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                パスワードを忘れた方
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-800 transition-all font-medium shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              ログイン
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-gray-400">
            デモ: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          © 2026 XXXXXX. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}
