import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/auth';
import { AccessDenied } from '../AccessDenied';
import { getSettings, saveSettings } from '../../../../lib/services/settings';
import {
  Globe, Layout, Search, Mail, BarChart, Palette, Shield, Bell, Save, Loader2, CheckCircle
} from 'lucide-react';

type SettingTab = 'general' | 'display' | 'search' | 'contact' | 'seo' | 'analytics' | 'theme' | 'security' | 'notifications';

const DEFAULTS: Record<string, string> = {
  site_name: 'FAQ-CMS ヘルプセンター',
  site_description: 'よくあるご質問とその回答を掲載しています。',
  site_url: '',
  language: 'ja',
  layout: 'grid',
  category_count: '6',
  article_order: 'updated',
  show_views: 'true',
  show_date: 'true',
  show_breadcrumb: 'true',
  show_feedback: 'true',
  search_suggest: 'true',
  search_history: 'true',
  search_similar: 'false',
  search_max_results: '20',
  search_suggest_count: '5',
  search_history_days: '90',
  contact_enabled: 'true',
  contact_email: '',
  contact_auto_reply: 'true',
  contact_reply_subject: 'お問い合わせを受け付けました',
  contact_reply_body: 'この度はお問い合わせいただき、ありがとうございます。\n内容を確認の上、担当者より改めてご連絡させていただきます。\n\n※このメールは自動送信されています。',
  seo_meta_description: 'よくあるご質問とその回答を掲載したヘルプセンターです。',
  seo_ogp_url: '',
  seo_allow_index: 'true',
  seo_sitemap: 'true',
  analytics_ga_id: '',
  analytics_gtm_id: '',
  analytics_custom_code: '',
  analytics_internal: 'true',
  theme_color: 'amber',
  theme_font: 'noto-sans-jp',
  theme_radius: 'medium',
  security_2fa: 'false',
  security_min_password: '8',
  security_session_timeout: '60',
  security_ip_restriction: 'false',
  notify_new_contact: 'true',
  notify_new_feedback: 'true',
  notify_weekly: 'false',
  notify_monthly: 'false',
  notify_email: '',
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SettingsPage() {
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    getSettings().then(data => {
      setSettings(prev => ({ ...prev, ...data }))
      setLoading(false)
    })
  }, [])

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }))

  const toggle = (key: string) =>
    setSettings(prev => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }))

  const handleSave = async () => {
    setSaveState('saving')
    const ok = await saveSettings(settings)
    setSaveState(ok ? 'saved' : 'error')
    if (ok) setTimeout(() => setSaveState('idle'), 2000)
  }

  const tabs = [
    { id: 'general' as const,       label: 'サイト基本設定', icon: Globe },
    { id: 'display' as const,       label: '表示設定',       icon: Layout },
    { id: 'search' as const,        label: '検索設定',       icon: Search },
    { id: 'contact' as const,       label: '問い合わせ',     icon: Mail },
    { id: 'seo' as const,           label: 'SEO設定',        icon: BarChart },
    { id: 'analytics' as const,     label: '分析設定',       icon: BarChart },
    { id: 'theme' as const,         label: 'テーマ設定',     icon: Palette },
    { id: 'security' as const,      label: 'セキュリティ',   icon: Shield },
    { id: 'notifications' as const, label: '通知設定',       icon: Bell },
  ];

  if (!can('settings.manage')) return <AccessDenied />;

  if (loading) return <div className="p-8 text-sm text-gray-500">読み込み中…</div>

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
  const checkboxClass = "text-amber-600 rounded"
  const labelClass = "block text-sm font-medium text-gray-900 mb-1.5"
  const hintClass = "mt-1 text-xs text-gray-500"

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">設定</h1>
          <p className="text-sm text-gray-600">FAQサイトの全体設定を管理します</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors text-sm disabled:opacity-50"
        >
          {saveState === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
          {saveState === 'saved' && <CheckCircle className="w-4 h-4" />}
          {saveState === 'idle' || saveState === 'error' ? <Save className="w-4 h-4" /> : null}
          {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '保存しました' : saveState === 'error' ? '保存失敗' : '変更を保存'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 shrink-0">
          <nav className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-2 ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-700 border-amber-500 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6">

          {/* サイト基本設定 */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">サイト基本設定</h2>
              <div>
                <label className={labelClass}>サイト名 <span className="text-red-500">*</span></label>
                <input type="text" className={inputClass} value={settings.site_name}
                  onChange={e => set('site_name', e.target.value)} />
                <p className={hintClass}>ブラウザのタイトルやヘッダーに表示されます</p>
              </div>
              <div>
                <label className={labelClass}>サイトの説明</label>
                <textarea className={inputClass} rows={3} value={settings.site_description}
                  onChange={e => set('site_description', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>サイトURL</label>
                <input type="url" className={inputClass} value={settings.site_url}
                  placeholder="https://faq.example.com"
                  onChange={e => set('site_url', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>言語設定</label>
                <select className={inputClass} value={settings.language}
                  onChange={e => set('language', e.target.value)}>
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          )}

          {/* 表示設定 */}
          {activeTab === 'display' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">表示設定</h2>
              <div>
                <label className={labelClass}>トップページのレイアウト</label>
                <select className={inputClass} value={settings.layout}
                  onChange={e => set('layout', e.target.value)}>
                  <option value="grid">グリッド表示</option>
                  <option value="list">リスト表示</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>カテゴリ表示数</label>
                <input type="number" className={inputClass} min={4} max={12}
                  value={settings.category_count}
                  onChange={e => set('category_count', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>記事一覧の表示順</label>
                <select className={inputClass} value={settings.article_order}
                  onChange={e => set('article_order', e.target.value)}>
                  <option value="updated">更新日時（新しい順）</option>
                  <option value="created">作成日時（新しい順）</option>
                  <option value="views">閲覧数（多い順）</option>
                </select>
              </div>
              <div className="space-y-3">
                <p className={labelClass}>表示オプション</p>
                {[
                  { key: 'show_views', label: '記事の閲覧数を表示' },
                  { key: 'show_date', label: '更新日時を表示' },
                  { key: 'show_breadcrumb', label: 'パンくずリストを表示' },
                  { key: 'show_feedback', label: 'フィードバックウィジェットを表示' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={checkboxClass}
                      checked={settings[item.key] === 'true'}
                      onChange={() => toggle(item.key)} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 検索設定 */}
          {activeTab === 'search' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">検索設定</h2>
              <div className="space-y-3">
                {[
                  { key: 'search_suggest', label: 'サジェスト機能を有効にする' },
                  { key: 'search_history', label: '検索履歴を記録する' },
                  { key: 'search_similar', label: '類似記事を提案する' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={checkboxClass}
                      checked={settings[item.key] === 'true'}
                      onChange={() => toggle(item.key)} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className={labelClass}>検索結果の最大表示件数</label>
                <input type="number" className={inputClass} min={10} max={100}
                  value={settings.search_max_results}
                  onChange={e => set('search_max_results', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>サジェスト候補の表示数</label>
                <input type="number" className={inputClass} min={3} max={10}
                  value={settings.search_suggest_count}
                  onChange={e => set('search_suggest_count', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>検索履歴の保存期間</label>
                <select className={inputClass} value={settings.search_history_days}
                  onChange={e => set('search_history_days', e.target.value)}>
                  <option value="30">30日間</option>
                  <option value="90">90日間</option>
                  <option value="180">180日間</option>
                  <option value="365">1年間</option>
                  <option value="0">無期限</option>
                </select>
              </div>
            </div>
          )}

          {/* 問い合わせ設定 */}
          {activeTab === 'contact' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">問い合わせ設定</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={checkboxClass}
                  checked={settings.contact_enabled === 'true'}
                  onChange={() => toggle('contact_enabled')} />
                <span className="text-sm font-medium text-gray-900">問い合わせフォームを有効にする</span>
              </label>
              <div>
                <label className={labelClass}>問い合わせ先メールアドレス <span className="text-red-500">*</span></label>
                <input type="email" className={inputClass} value={settings.contact_email}
                  placeholder="support@example.com"
                  onChange={e => set('contact_email', e.target.value)} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={checkboxClass}
                  checked={settings.contact_auto_reply === 'true'}
                  onChange={() => toggle('contact_auto_reply')} />
                <span className="text-sm font-medium text-gray-900">自動返信メールを送信する</span>
              </label>
              <div>
                <label className={labelClass}>自動返信メールの件名</label>
                <input type="text" className={inputClass} value={settings.contact_reply_subject}
                  onChange={e => set('contact_reply_subject', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>自動返信メールの本文</label>
                <textarea className={inputClass} rows={6} value={settings.contact_reply_body}
                  onChange={e => set('contact_reply_body', e.target.value)} />
              </div>
            </div>
          )}

          {/* SEO設定 */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">SEO設定</h2>
              <div>
                <label className={labelClass}>メタディスクリプション</label>
                <textarea className={inputClass} rows={3} value={settings.seo_meta_description}
                  onChange={e => set('seo_meta_description', e.target.value)} />
                <p className={hintClass}>検索エンジンの結果に表示される説明文（160文字以内推奨）</p>
              </div>
              <div>
                <label className={labelClass}>OGP画像URL</label>
                <input type="url" className={inputClass} value={settings.seo_ogp_url}
                  placeholder="https://example.com/ogp.png"
                  onChange={e => set('seo_ogp_url', e.target.value)} />
                <p className={hintClass}>SNSでシェアされた際に表示される画像（1200×630px推奨）</p>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'seo_allow_index', label: '検索エンジンのインデックスを許可' },
                  { key: 'seo_sitemap', label: 'サイトマップを自動生成' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={checkboxClass}
                      checked={settings[item.key] === 'true'}
                      onChange={() => toggle(item.key)} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 分析設定 */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">分析設定</h2>
              <div>
                <label className={labelClass}>Google Analytics 測定ID</label>
                <input type="text" className={inputClass} value={settings.analytics_ga_id}
                  placeholder="G-XXXXXXXXXX"
                  onChange={e => set('analytics_ga_id', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Google Tag Manager ID</label>
                <input type="text" className={inputClass} value={settings.analytics_gtm_id}
                  placeholder="GTM-XXXXXXX"
                  onChange={e => set('analytics_gtm_id', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>カスタムトラッキングコード</label>
                <textarea className={`${inputClass} font-mono text-xs`} rows={5}
                  value={settings.analytics_custom_code}
                  placeholder="<!-- カスタムコード -->"
                  onChange={e => set('analytics_custom_code', e.target.value)} />
                <p className={hintClass}>headタグ内に挿入されます</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className={checkboxClass}
                  checked={settings.analytics_internal === 'true'}
                  onChange={() => toggle('analytics_internal')} />
                <span className="text-sm text-gray-700">内部分析機能を有効にする</span>
              </label>
            </div>
          )}

          {/* テーマ設定 */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">テーマ設定</h2>
              <div>
                <label className={labelClass}>カラースキーム</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'amber', label: 'Amber', color: 'bg-amber-500', desc: '温かみのあるオレンジ' },
                    { value: 'blue',  label: 'Blue',  color: 'bg-blue-500',  desc: '信頼感のある青' },
                    { value: 'green', label: 'Green', color: 'bg-green-500', desc: '安心感のある緑' },
                  ].map(c => (
                    <button key={c.value} onClick={() => set('theme_color', c.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${settings.theme_color === c.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-5 h-5 rounded ${c.color}`} />
                        <span className="text-sm font-medium">{c.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>フォント</label>
                <select className={inputClass} value={settings.theme_font}
                  onChange={e => set('theme_font', e.target.value)}>
                  <option value="noto-sans-jp">Noto Sans JP</option>
                  <option value="inter">Inter</option>
                  <option value="system">システムフォント</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>角丸の大きさ</label>
                <select className={inputClass} value={settings.theme_radius}
                  onChange={e => set('theme_radius', e.target.value)}>
                  <option value="none">なし</option>
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
            </div>
          )}

          {/* セキュリティ */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">セキュリティ設定</h2>
              <div className="space-y-3">
                {[
                  { key: 'security_2fa', label: '2段階認証を必須にする' },
                  { key: 'security_ip_restriction', label: 'IPアドレス制限を有効にする' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={checkboxClass}
                      checked={settings[item.key] === 'true'}
                      onChange={() => toggle(item.key)} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className={labelClass}>パスワードの最小文字数</label>
                <input type="number" className={inputClass} min={6} max={32}
                  value={settings.security_min_password}
                  onChange={e => set('security_min_password', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>セッションタイムアウト（分）</label>
                <input type="number" className={inputClass} min={15} max={1440}
                  value={settings.security_session_timeout}
                  onChange={e => set('security_session_timeout', e.target.value)} />
              </div>
            </div>
          )}

          {/* 通知設定 */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-medium text-gray-900 mb-4">通知設定</h2>
              <div>
                <label className={labelClass}>通知先メールアドレス</label>
                <input type="email" className={inputClass} value={settings.notify_email}
                  placeholder="admin@example.com"
                  onChange={e => set('notify_email', e.target.value)} />
                <p className={hintClass}>複数の場合はカンマ区切り</p>
              </div>
              <div className="space-y-3">
                <p className={labelClass}>メール通知タイミング</p>
                {[
                  { key: 'notify_new_contact', label: '新しい問い合わせ' },
                  { key: 'notify_new_feedback', label: '新しいフィードバック' },
                  { key: 'notify_weekly', label: '週次レポート' },
                  { key: 'notify_monthly', label: '月次レポート' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className={checkboxClass}
                      checked={settings[item.key] === 'true'}
                      onChange={() => toggle(item.key)} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
