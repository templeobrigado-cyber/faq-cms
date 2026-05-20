import { Home, Search, Mail, AlertTriangle } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface NotFoundPageProps {
  type?: '404' | 'error';
  errorMessage?: string;
}

export function NotFoundPage({ type = '404', errorMessage }: NotFoundPageProps) {
  const footerCategories = [
    { name: '機能説明', href: '/category/features' },
    { name: '契約・支払方法', href: '/category/billing' },
    { name: 'アカウント', href: '/category/account' },
    { name: 'トラブルシューティング', href: '/category/troubleshooting' }
  ];

  const is404 = type === '404';

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="compact" onBack={() => window.history.back()} />

      <main className="flex-1 bg-background flex items-center">
        <div className="max-w-[800px] mx-auto px-6 md:px-8 lg:px-12 py-20 text-center w-full">
          {/* エラーアイコン */}
          <div className="mb-12 flex flex-col items-center">
            {is404 ? (
              <>
                {/* Sad document icon */}
                <div className="mb-2">
                  <svg width="200" height="240" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Document body with folded corner */}
                    <path d="M40 0 L140 0 L180 40 L180 200 L160 220 L140 200 L120 220 L100 200 L80 220 L60 200 L40 220 L40 0 Z" fill="#FF9D1A" />
                    <path d="M140 0 L140 40 L180 40 Z" fill="#E68A00" />

                    {/* X eyes */}
                    <g>
                      <line x1="75" y1="85" x2="95" y2="105" stroke="white" strokeWidth="8" strokeLinecap="round" />
                      <line x1="95" y1="85" x2="75" y2="105" stroke="white" strokeWidth="8" strokeLinecap="round" />
                    </g>
                    <g>
                      <line x1="125" y1="85" x2="145" y2="105" stroke="white" strokeWidth="8" strokeLinecap="round" />
                      <line x1="145" y1="85" x2="125" y2="105" stroke="white" strokeWidth="8" strokeLinecap="round" />
                    </g>

                    {/* Sad mouth */}
                    <path d="M 70 150 Q 110 135 150 150" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none" />
                  </svg>
                </div>

                {/* 404 text */}
                <div className="text-[120px] font-bold leading-none text-red-400 mb-4 select-none">
                  404
                </div>
                <h1 className="text-2xl font-bold text-gray-700 uppercase tracking-wide">
                  Page Not Found
                </h1>
              </>
            ) : (
              <>
                <div className="w-40 h-40 flex items-center justify-center mb-8">
                  <AlertTriangle className="w-full h-full text-red-400 drop-shadow-lg" strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl mb-4 text-gray-900">
                  エラーが発生しました
                </h1>
              </>
            )}
          </div>

          {/* エラー説明テキスト */}
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto">
            {is404
              ? 'お探しのページは存在しないか、移動または削除された可能性があります。'
              : errorMessage || '予期しないエラーが発生しました。しばらく時間をおいてから再度お試しください。'}
          </p>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5" />
              トップページへ戻る
            </a>
            {is404 && (
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
              >
                <Mail className="w-5 h-5" />
                お問い合わせ
              </a>
            )}
          </div>

          {/* よく見られている記事 */}
          {is404 && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-200 rounded-lg p-8 shadow-sm">
              <h2 className="text-xl text-gray-900 mb-6 flex items-center justify-center gap-2">
                <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                よく見られている記事
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <a
                  href="/article/password-reset"
                  className="block p-4 bg-white border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                    パスワードの変更とリセット
                  </h3>
                  <p className="text-sm text-gray-600">
                    セキュリティを保つための手順
                  </p>
                </a>
                <a
                  href="/article/two-factor"
                  className="block p-4 bg-white border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                    2段階認証の設定方法
                  </h3>
                  <p className="text-sm text-gray-600">
                    アカウントのセキュリティ強化
                  </p>
                </a>
                <a
                  href="/article/profile-change"
                  className="block p-4 bg-white border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                    プロフィール情報の変更
                  </h3>
                  <p className="text-sm text-gray-600">
                    ユーザー情報の更新手順
                  </p>
                </a>
                <a
                  href="/article/billing"
                  className="block p-4 bg-white border-2 border-amber-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                    料金プランの変更方法
                  </h3>
                  <p className="text-sm text-gray-600">
                    プランのアップグレード・ダウングレード
                  </p>
                </a>
              </div>
            </div>
          )}

          {/* エラー詳細（エラーページの場合） */}
          {!is404 && errorMessage && (
            <div className="mt-8 p-6 bg-white border-2 border-gray-200 rounded-lg text-left shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">エラー詳細</h3>
              <code className="text-sm text-gray-800 font-mono bg-gray-50 p-3 rounded block overflow-x-auto">
                {errorMessage}
              </code>
            </div>
          )}
        </div>
      </main>

      <Footer
        variant="regular"
        categories={footerCategories}
        backToSite={{ name: 'Main Site', href: 'https://example.com' }}
      />
    </div>
  );
}
