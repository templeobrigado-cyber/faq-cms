import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Breadcrumbs } from '../Breadcrumbs';
import { sendNotification } from '../../../lib/services/notification';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const breadcrumbs = [
    { label: 'ホーム', href: '/' },
    { label: 'お問い合わせ' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification('new_contact', { name, email, subject, message });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header variant="compact" onBack={() => window.history.back()} />

        <main className="flex-1 bg-background">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 lg:px-12 py-12">
            <Breadcrumbs items={breadcrumbs} />

            <div className="mt-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mb-8 shadow-lg">
                <CheckCircle className="w-12 h-12 text-amber-600" />
              </div>
              <h1 className="text-3xl mb-4 text-gray-900">送信完了</h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                お問い合わせありがとうございます。<br />
                2営業日以内にご登録のメールアドレスへご返信いたします。
              </p>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-200 rounded-lg p-6 mb-8 text-left shadow-sm">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
                  お問い合わせ番号
                </h3>
                <p className="text-2xl font-mono font-bold text-amber-700 mb-2">
                  #2026051900123
                </p>
                <p className="text-sm text-gray-600">
                  お問い合わせの際は、この番号をお伝えください
                </p>
              </div>
              <a
                href="/"
                className="inline-block px-8 py-3 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                トップページへ戻る
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header variant="compact" onBack={() => window.history.back()} />

      <main className="flex-1 bg-background">
        <div className="max-w-[800px] mx-auto px-6 md:px-8 lg:px-12 py-12">
          <Breadcrumbs items={breadcrumbs} />

          {/* ページヘッダー */}
          <div className="mt-8 mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 border-2 border-amber-200">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <h1 className="text-2xl">お問い合わせ</h1>
            </div>
            <p className="text-gray-600 leading-relaxed">
              FAQで解決しない場合は、こちらのフォームからお問い合わせください。<br />
              2営業日以内にご返信いたします。
            </p>
          </div>

          {/* 注意事項 */}
          <div className="mb-8 bg-gradient-to-br from-amber-50 to-amber-100/40 border-2 border-amber-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-600 rounded-full"></span>
              お問い合わせ前にご確認ください
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>よくある質問で解決できる場合があります</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>土日祝日は休業日のため、返信までお時間をいただく場合があります</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold mt-0.5">•</span>
                <span>メールアドレスに誤りがあると返信できません。正確にご入力ください</span>
              </li>
            </ul>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-sm">
            {/* お名前 */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 transition-all"
                placeholder="山田 太郎"
              />
            </div>

            {/* メールアドレス */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 transition-all"
                placeholder="example@email.com"
              />
            </div>

            {/* お問い合わせ種別 */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-900 mb-2">
                お問い合わせ種別 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 transition-all bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.5rem'
                }}
              >
                <option value="">選択してください</option>
                <option value="technical">技術的な問題</option>
                <option value="billing">料金・請求について</option>
                <option value="account">アカウントについて</option>
                <option value="feature">機能について</option>
                <option value="other">その他</option>
              </select>
            </div>

            {/* 件名 */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 transition-all"
                placeholder="お問い合わせの件名を入力してください"
              />
            </div>

            {/* お問い合わせ内容 */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={8}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-300/30 transition-all resize-none"
                placeholder="できるだけ詳しくお書きください"
              />
            </div>

            {/* プライバシーポリシー同意 */}
            <div className="mb-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-5 h-5 border-2 border-gray-300 rounded focus:ring-4 focus:ring-amber-300/30 text-amber-600"
                />
                <span className="text-sm text-gray-700">
                  <a href="#" className="text-amber-600 hover:underline">プライバシーポリシー</a>
                  に同意します <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full px-6 py-4 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-800 transition-all font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              <Send className="w-5 h-5" />
              送信する
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
