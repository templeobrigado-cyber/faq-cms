import { HelpCircle, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../lib/auth';

const ROLE_LABEL = { admin: '管理者', editor: '編集者', viewer: '閲覧のみ' }

export function AdminTopbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 flex items-center justify-between px-6 shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium">管理画面</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="ml-2 w-px h-6 bg-white/30" />

        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-none">{user?.displayName ?? '管理者'}</p>
            {user && (
              <p className="text-xs text-white/70 mt-0.5">{ROLE_LABEL[user.role]}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          title="ログアウト"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
