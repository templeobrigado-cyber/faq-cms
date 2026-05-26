import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../lib/auth';
import { AccessDenied } from '../AccessDenied';
import { getSettings, saveSettings } from '../../../../lib/services/settings';
import { applyTheme, type ThemeColor } from '../../../../lib/theme';
import { applyFont, FONT_OPTIONS, type FontKey } from '../../../../lib/font';
import { uploadSiteAsset } from '../../../../lib/services/storage';
import { Upload, X as XIcon } from 'lucide-react';
import { applyRadius, RADIUS_OPTIONS, type RadiusKey } from '../../../../lib/radius';
import {
  Globe, Layout, Search, Mail, BarChart, Palette, Shield, Bell, Save, Loader2, CheckCircle,
  Sparkles, Eye, EyeOff,
} from 'lucide-react';

type SettingTab = 'general' | 'display' | 'search' | 'contact' | 'seo' | 'analytics' | 'theme' | 'security' | 'notifications' | 'ai';

const DEFAULTS: Record<string, string> = {
  site_name: 'FAQ-CMS ヘルプセンター',
  site_description: 'よくあるご質問とその回答を掲載しています。',
  site_url: '',
  site_logo_url: '',
  site_favicon_url: '',
  header_title: 'FAQ-CMS',
  header_subtitle: 'FAQ よくあるご質問',
  language: 'ja',
  layout: 'grid',
  category_count: '6',
  article_order: 'updated',
  search_placeholder: '検索（例：サイトレポートとは？）',
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
  notify_email: '',
  notify_article_published: 'false',
  notify_new_contact: 'true',
  notify_new_feedback: 'true',
  notify_zero_hit: 'false',
  notify_weekly: 'false',
  notify_monthly: 'false',
  ai_proofread_enabled: 'false',
  ai_api_key: '',
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingLogo(true);
    const result = await uploadSiteAsset(file);
    if (result.url) {
      set('site_logo_url', result.url);
    } else {
      setUploadError(`ロゴのアップロードに失敗しました: ${result.error}`);
    }
    setUploadingLogo(false);
    e.target.value = '';
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingFavicon(true);
    const result = await uploadSiteAsset(file);
    if (result.url) {
      set('site_favicon_url', result.url);
    } else {
      setUploadError(`ファビコンのアップロードに失敗しました: ${result.error}`);
    }
    setUploadingFavicon(false);
    e.target.value = '';
  };

  useEffect(() => {
    getSettings().then(data => {
      setSettings(prev => ({ ...prev, ...data }))
      setLoading(false)
    })
  }, [])

  // テーマタブを開いたらプレビュー用に全フォントをプリロード
  useEffect(() => {
    if (activeTab === 'theme') {
      FONT_OPTIONS.forEach(f => {
        if (!f.googleQuery) return
        const linkId = `gfont-preview-${f.key}`
        if (document.getElementById(linkId)) return
        const link = document.createElement('link')
        link.id = linkId
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${f.googleQuery}&display=swap`
        document.head.appendChild(link)
      })
    }
  }, [activeTab])

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
    { id: 'ai' as const,            label: 'AI設定',         icon: Sparkles },
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

              {/* アップロードエラー表示 */}
              {uploadError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span className="shrink-0">⚠️</span>
                  <div>
                    <p className="font-medium">アップロードエラー</p>
                    <p className="mt-0.5 text-xs">{uploadError}</p>
                    {uploadError.includes('Bucket not found') && (
                      <p className="mt-1 text-xs">Supabase ストレージに <code className="bg-red-100 px-1 rounded">site-assets</code> バケットが存在しません。下記の手順で作成してください。</p>
                    )}
                    {uploadError.includes('row-level security') || uploadError.includes('policy') ? (
                      <p className="mt-1 text-xs">バケットのRLSポリシーでアップロードが拒否されました。Supabase の Storage → site-assets → Policies でアップロードを許可してください。</p>
                    ) : null}
                    <button onClick={() => setUploadError(null)} className="mt-2 text-xs underline">閉じる</button>
                  </div>
                </div>
              )}

              {/* サイトロゴ */}
              <div>
                <label className={labelClass}>サイトロゴ</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    {settings.site_logo_url
                      ? <img src={settings.site_logo_url} alt="logo" className="max-w-full max-h-full object-contain p-1" />
                      : <span className="text-xs text-gray-400">未設定</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <button onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      {uploadingLogo ? 'アップロード中…' : '画像を選択'}
                    </button>
                    {settings.site_logo_url && (
                      <button onClick={() => set('site_logo_url', '')}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                        <XIcon className="w-3 h-3" /> 削除
                      </button>
                    )}
                    <p className="text-xs text-gray-400">PNG / SVG 推奨。ヘッダーのテキストと差し替わります。</p>
                  </div>
                </div>
              </div>

              {/* ファビコン */}
              <div>
                <label className={labelClass}>ファビコン</label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                    {settings.site_favicon_url
                      ? <img src={settings.site_favicon_url} alt="favicon" className="w-10 h-10 object-contain" />
                      : <span className="text-xs text-gray-400">未設定</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <input ref={faviconInputRef} type="file" accept="image/png,image/x-icon,image/svg+xml" className="hidden" onChange={handleFaviconUpload} />
                    <button onClick={() => faviconInputRef.current?.click()} disabled={uploadingFavicon}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      {uploadingFavicon ? 'アップロード中…' : '画像を選択'}
                    </button>
                    {settings.site_favicon_url && (
                      <button onClick={() => set('site_favicon_url', '')}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                        <XIcon className="w-3 h-3" /> 削除
                      </button>
                    )}
                    <p className="text-xs text-gray-400">PNG / ICO / SVG。32×32px 推奨。</p>
                  </div>
                </div>
              </div>

              {/* ヘッダーテキスト */}
              <div>
                <label className={labelClass}>ヘッダータイトル</label>
                <input type="text" className={inputClass} value={settings.header_title}
                  onChange={e => set('header_title', e.target.value)}
                  placeholder="FAQ-CMS" />
                <p className={hintClass}>ロゴ未設定時にヘッダー左に表示されます</p>
              </div>
              <div>
                <label className={labelClass}>ヘッダーサブタイトル</label>
                <input type="text" className={inputClass} value={settings.header_subtitle}
                  onChange={e => set('header_subtitle', e.target.value)}
                  placeholder="FAQ よくあるご質問" />
              </div>

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
                <label className={labelClass}>検索窓のプレースホルダーテキスト</label>
                <input
                  type="text"
                  className={inputClass}
                  value={settings.search_placeholder}
                  onChange={e => set('search_placeholder', e.target.value)}
                  placeholder="例：何かお困りですか？"
                />
                <p className="text-xs text-gray-400 mt-1">トップページと各ページのヘッダー検索窓に表示されます</p>
              </div>
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
                    { value: 'amber', label: 'Yellow', hex: '#FFD008', desc: 'ブランドイエロー' },
                    { value: 'blue',  label: 'Sea Blue Mist', hex: '#9FC7D8', desc: '落ち着いたブルー' },
                    { value: 'green', label: 'Green', hex: '#A6E1CA', desc: '清潔感のあるグリーン' },
                  ].map(c => (
                    <button key={c.value} onClick={() => {
                      set('theme_color', c.value)
                      applyTheme(c.value as ThemeColor)
                    }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${settings.theme_color === c.value ? 'border-amber-600 ring-2 ring-amber-300/40' : 'border-gray-200 hover:border-gray-300'}`}>
                      {/* カラープレビュー */}
                      <div className="w-full h-12 rounded-md mb-3 shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-sm font-medium text-gray-900 block">{c.label}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>フォント</label>
                <div className="grid grid-cols-2 gap-3">
                  {FONT_OPTIONS.map(f => (
                    <button key={f.key} onClick={() => {
                      set('theme_font', f.key)
                      applyFont(f.key as FontKey)
                    }}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${settings.theme_font === f.key ? 'border-amber-600 ring-2 ring-amber-300/40' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="text-base font-medium text-gray-900 mb-1" style={{ fontFamily: f.family }}>
                        あのイーハトーヴォ
                      </p>
                      <p className="text-xs text-gray-500">{f.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>角丸の大きさ</label>
                <div className="grid grid-cols-4 gap-3">
                  {RADIUS_OPTIONS.map(r => (
                    <button key={r.key} onClick={() => {
                      set('theme_radius', r.key)
                      applyRadius(r.key as RadiusKey)
                    }}
                      className={`p-4 border-2 transition-all text-center ${settings.theme_radius === r.key ? 'border-amber-600 ring-2 ring-amber-300/40' : 'border-gray-200 hover:border-gray-300'}`}
                      style={{ borderRadius: r.md }}>
                      {/* プレビュー：ボタン風の四角 */}
                      <div
                        className="w-full h-8 bg-amber-600 mb-2 mx-auto"
                        style={{ borderRadius: r.lg }}
                      />
                      <span className="text-xs text-gray-700 font-medium">{r.label}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.md}</p>
                    </button>
                  ))}
                </div>
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
            <div className="space-y-6">
              <div>
                <h2 className="font-medium text-gray-900 mb-1">通知設定</h2>
                <p className="text-sm text-gray-500">各イベントが発生したときにメールで通知します。</p>
              </div>

              {/* 通知先 */}
              <div>
                <label className={labelClass}>通知先メールアドレス</label>
                <input
                  type="text"
                  className={inputClass}
                  value={settings.notify_email}
                  placeholder="admin@example.com"
                  onChange={e => set('notify_email', e.target.value)}
                />
                <p className={hintClass}>複数の場合はカンマ区切り（例: a@example.com, b@example.com）</p>
              </div>

              {/* 即時通知 */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">即時通知</p>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {[
                    {
                      key: 'notify_article_published',
                      label: '記事が公開されたとき',
                      desc: '記事ステータスが「公開」に変更されるたびに通知します',
                    },
                    {
                      key: 'notify_new_contact',
                      label: '問い合わせが届いたとき',
                      desc: '問い合わせフォームから新しいメッセージが送信されたときに通知します',
                    },
                    {
                      key: 'notify_new_feedback',
                      label: 'フィードバックが届いたとき',
                      desc: '「役に立たなかった」のフィードバックにコメントが付いたときに通知します',
                    },
                    {
                      key: 'notify_zero_hit',
                      label: 'ヒット0クエリが検出されたとき',
                      desc: '検索結果が0件のクエリが一定数を超えたときに通知します',
                    },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-4 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(item.key)}
                        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          settings[item.key] === 'true' ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                          settings[item.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 定期レポート */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">定期レポート</p>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {[
                    {
                      key: 'notify_weekly',
                      label: '週次レポート',
                      desc: '毎週月曜日に先週のアクセス・フィードバック・問い合わせ件数を送信します',
                    },
                    {
                      key: 'notify_monthly',
                      label: '月次レポート',
                      desc: '毎月1日に先月の集計データとヒット0クエリのまとめを送信します',
                    },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-4 px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(item.key)}
                        className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          settings[item.key] === 'true' ? 'bg-amber-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                          settings[item.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI設定 */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-medium text-gray-900 mb-1">AI設定</h2>
                <p className="text-sm text-gray-500">Anthropic Claude を使ったAI校正機能の設定を行います。</p>
              </div>

              {/* AI校正機能 ON/OFF */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-0.5">AI校正機能</p>
                    <p className="text-xs text-gray-500">記事エディタでSEO・AIOを考慮したAI校正ボタンを表示します。<br />記事タイトル・リード文・セクション本文に個別で適用できます。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle('ai_proofread_enabled')}
                    className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.ai_proofread_enabled === 'true' ? 'bg-amber-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                        settings.ai_proofread_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Anthropic API キー */}
              <div>
                <label className={labelClass}>
                  Anthropic API キー
                  <span className="ml-2 text-xs font-normal text-gray-400">（AI校正機能を使用する場合に必要）</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className={`${inputClass} pr-10 font-mono`}
                    value={settings.ai_api_key}
                    onChange={e => set('ai_api_key', e.target.value)}
                    placeholder="sk-ant-..."
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={hintClass}>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 hover:underline"
                  >
                    Anthropic Console
                  </a>{' '}
                  でAPIキーを取得してください。このキーは Supabase Edge Function 経由でのみ使用されます。
                </p>
              </div>

              {/* 使い方ガイド */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  セットアップ手順
                </p>
                <ol className="text-xs text-amber-700 space-y-2 list-decimal list-inside">
                  <li>Supabase CLI で Edge Function をデプロイ：<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">supabase functions deploy ai-proofread</code></li>
                  <li>APIキーを上記フォームに入力して「変更を保存」をクリック</li>
                  <li>AI校正機能のトグルをONにして保存</li>
                  <li>記事エディタを開くと各フィールドに <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-600 text-white rounded text-[10px]"><Sparkles className="w-2.5 h-2.5" />AI校正</span> ボタンが表示されます</li>
                </ol>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
