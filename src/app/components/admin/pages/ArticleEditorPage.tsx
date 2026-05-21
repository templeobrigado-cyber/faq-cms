import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Globe,
  Plus,
  GripVertical,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getArticleById, createArticle, updateArticle, upsertSections, syncArticleTags } from '../../../../lib/services/articles';
import { getCategories } from '../../../../lib/services/categories';
import { getTags } from '../../../../lib/services/tags';
import { uploadImage } from '../../../../lib/services/storage';
import { isSupabaseConfigured } from '../../../../lib/supabase';
import type { Category, Tag, CreateSectionInput, ArticleStatus } from '../../../../lib/types';
import { SectionCard } from '../../SectionCard';

interface LocalSection {
  id: string;
  type: 'overview' | 'analysis' | 'procedure' | 'troubleshoot' | 'note' | 'media';
  title: string;
  subtitle?: string;
  body_md: string;
  mediaUrl?: string;
  mediaProvider?: 'youtube' | 'vimeo' | 'image';
  order: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function generateSlug(title: string): string {
  const ascii = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return ascii.length > 3 ? ascii : `article-${Date.now()}`;
}

export function ArticleEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewArticle = !id;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [lead, setLead] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [sections, setSections] = useState<LocalSection[]>([]);
  const [newSectionType, setNewSectionType] = useState<LocalSection['type'] | ''>('');
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(!isNewArticle);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const dragOverEl = useRef<HTMLElement | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // 自動保存用
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    getCategories().then(setCategories);
    getTags().then(setAllTags);
    if (isNewArticle) {
      const titleParam = searchParams.get('title')
      if (titleParam) setTitle(titleParam)
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getArticleById(id).then((article) => {
      if (!article) { navigate('/admin/articles'); return; }
      setTitle(article.title);
      setSlug(article.slug);
      setCategoryId(article.category_id ?? '');
      setLead(article.lead ?? '');
      setStatus(article.status);
      setPublishedAt(
        article.published_at
          ? new Date(article.published_at).toISOString().slice(0, 16)
          : ''
      );
      setSelectedTagIds((article.tags ?? []).map(t => t.id));
      setSections(
        (article.sections ?? []).map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          subtitle: s.subtitle,
          body_md: s.body_md,
          mediaUrl: s.media_url,
          mediaProvider: s.media_provider,
          order: s.order,
        }))
      );
      setIsLoading(false);
    });
  }, [id, navigate]);

  const handleTitleBlur = () => {
    if (isNewArticle && !slug && title) {
      setSlug(generateSlug(title));
    }
  };

  const handleAddSection = () => {
    if (!newSectionType) return;
    setSections([
      ...sections,
      {
        id: `sec-${Date.now()}`,
        type: newSectionType as LocalSection['type'],
        title: '',
        body_md: '',
        order: sections.length + 1,
      },
    ]);
    setNewSectionType('');
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const handleDragStart = (e: React.DragEvent, index: number, id: string) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index)); // Firefox対応
    // ドラッグ画像をカード全体（グリップの親の親）に設定
    const card = (e.currentTarget as HTMLElement).closest('.border-2') as HTMLElement;
    if (card) e.dataTransfer.setDragImage(card, 20, 20);
    // state更新はdataTransfer設定の後（再レンダリングを遅らせる）
    setTimeout(() => setDraggingId(id), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // 前のhover要素からクラスを除去
    if (dragOverEl.current) {
      dragOverEl.current.classList.remove('ring-2', 'ring-amber-400', '-translate-y-0.5');
    }
    // 現在の要素にクラスを付与（再レンダリングなし）
    const el = e.currentTarget as HTMLElement;
    el.classList.add('ring-2', 'ring-amber-400', '-translate-y-0.5');
    dragOverEl.current = el;
    dragOverIndex.current = index;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // 子要素へ移動した場合は無視
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('ring-2', 'ring-amber-400', '-translate-y-0.5');
    if (dragOverEl.current === el) dragOverEl.current = null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    // hover強調を除去
    if (dragOverEl.current) {
      dragOverEl.current.classList.remove('ring-2', 'ring-amber-400', '-translate-y-0.5');
      dragOverEl.current = null;
    }
    if (from === null || to === null || from === to) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setSections(reordered.map((s, i) => ({ ...s, order: i + 1 })));
    scheduleAutoSave();
  };

  const handleDragEnd = () => {
    if (dragOverEl.current) {
      dragOverEl.current.classList.remove('ring-2', 'ring-amber-400', '-translate-y-0.5');
      dragOverEl.current = null;
    }
    dragIndex.current = null;
    dragOverIndex.current = null;
    setDraggingId(null);
  };

  const handleSectionChange = (
    sectionId: string,
    field: keyof LocalSection,
    value: string
  ) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)));
    scheduleAutoSave();
  };

  const handleMediaUrlChange = (sectionId: string, url: string) => {
    let provider: LocalSection['mediaProvider'] = undefined;
    if (/youtube\.com|youtu\.be/.test(url)) provider = 'youtube';
    else if (/vimeo\.com/.test(url)) provider = 'vimeo';
    else if (url.trim()) provider = 'image';
    setSections(sections.map((s) =>
      s.id === sectionId ? { ...s, mediaUrl: url, mediaProvider: provider } : s
    ));
  };

  const handleImageUpload = async (sectionId: string, file: File) => {
    setUploadingId(sectionId);
    const result = await uploadImage(file);
    if (result.url) {
      setSections(sections.map(s =>
        s.id === sectionId ? { ...s, mediaUrl: result.url!, mediaProvider: 'image' } : s
      ));
    } else {
      alert(`アップロードに失敗しました: ${result.error}`);
    }
    setUploadingId(null);
  };

  const getEmbedUrl = (url: string, provider?: LocalSection['mediaProvider']): string => {
    if (provider === 'youtube') {
      const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
      return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : '';
    }
    if (provider === 'vimeo') {
      const m = url.match(/vimeo\.com\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : '';
    }
    return '';
  };

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    if (!isSupabaseConfigured) {
      alert('Supabase が未設定のため、デモモードでは保存できません。\n.env に接続情報を設定してください。');
      return;
    }

    const finalStatus: ArticleStatus = publish ? 'published' : status;
    const finalSlug = slug || generateSlug(title);

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const articleInput = {
        title,
        slug: finalSlug,
        category_id: categoryId || null,
        lead,
        status: finalStatus,
        published_at: publish
          ? new Date().toISOString()
          : publishedAt
          ? new Date(publishedAt).toISOString()
          : null,
        created_by: 'admin',
      } as any;

      let savedId = id;

      if (isNewArticle) {
        const created = await createArticle(articleInput);
        if (!created) throw new Error('記事の作成に失敗しました');
        savedId = created.id;
        setSlug(finalSlug);
      } else {
        const updated = await updateArticle(id!, articleInput);
        if (!updated) throw new Error('記事の更新に失敗しました');
      }

      const sectionInputs: CreateSectionInput[] = sections.map((s, i) => ({
        article_id: savedId!,
        order: i + 1,
        type: s.type,
        title: s.title,
        subtitle: s.subtitle,
        body_md: s.body_md,
        media_url: s.mediaUrl,
        media_provider: s.mediaProvider,
      }));

      await upsertSections(savedId!, sectionInputs);
      await syncArticleTags(savedId!, selectedTagIds);

      if (publish) setStatus('published');
      setSaveStatus('saved');

      if (isNewArticle) {
        navigate(`/admin/articles/${savedId}/edit`, { replace: true });
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // 自動保存：編集後3秒でトリガー（新規記事は保存済みIDがないためスキップ）
  const scheduleAutoSave = useCallback(() => {
    if (isNewArticle || !isSupabaseConfigured) return;
    isDirtyRef.current = true;
    setAutoSaveStatus('pending');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSave(false).then(() => {
        isDirtyRef.current = false;
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      });
    }, 3000);
  }, [isNewArticle, title, slug, categoryId, selectedTagIds, lead, status, publishedAt, sections]);

  // 30秒ごとのフォールバック自動保存
  useEffect(() => {
    if (isNewArticle || !isSupabaseConfigured) return;
    const interval = setInterval(() => {
      if (isDirtyRef.current) {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        handleSave(false).then(() => {
          isDirtyRef.current = false;
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isNewArticle, title, slug, categoryId, selectedTagIds, lead, status, publishedAt, sections]);

  const sectionTypes = [
    { value: 'overview',      label: '概要',            color: 'bg-amber-600',  description: '記事の概要・まとめ' },
    { value: 'analysis',      label: '分析',            color: 'bg-blue-600',   description: '原因分析・背景説明' },
    { value: 'procedure',     label: '手順',            color: 'bg-green-600',  description: 'ステップバイステップの手順' },
    { value: 'troubleshoot',  label: 'トラブルシュート', color: 'bg-red-600',   description: '問題解決方法' },
    { value: 'note',          label: '注意事項',        color: 'bg-purple-600', description: '注意点・補足情報' },
    { value: 'media',         label: 'メディア',        color: 'bg-orange-500', description: '画像・動画コンテンツ' },
  ];

  const getSectionTypeInfo = (type: LocalSection['type']) =>
    sectionTypes.find((t) => t.value === type) ?? sectionTypes[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b-2 border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/articles')}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isNewArticle ? '新規記事の作成' : '記事の編集'}
            </h1>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-sm text-amber-600">保存中...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  保存しました
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  保存に失敗しました
                </span>
              )}
              {saveStatus === 'idle' && autoSaveStatus === 'pending' && (
                <span className="text-sm text-gray-400">編集中…</span>
              )}
              {saveStatus === 'idle' && autoSaveStatus === 'saving' && (
                <span className="text-sm text-amber-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />自動保存中…
                </span>
              )}
              {saveStatus === 'idle' && autoSaveStatus === 'saved' && (
                <span className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />自動保存済み
                </span>
              )}
              {saveStatus === 'idle' && autoSaveStatus === 'idle' && (
                <span className="text-sm text-gray-500">{title || '記事タイトル未設定'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
              showPreview
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'エディタに戻る' : 'プレビュー'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 disabled:cursor-not-allowed ${
              saveStatus === 'saved'
                ? 'border-green-400 bg-green-50 text-green-700'
                : saveStatus === 'error'
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            下書き保存
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:cursor-not-allowed ${
              isSaving
                ? 'bg-amber-400 text-gray-900'
                : 'bg-amber-600 text-gray-900 hover:bg-amber-700 active:scale-95'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            公開
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Metadata */}
        <div className="w-80 bg-white border-r-2 border-gray-200 p-6 space-y-6 overflow-y-auto h-[calc(100vh-73px)]">
          <h2 className="text-base font-bold text-gray-900">記事情報</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              タイトル <span className="text-red-500">必須</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); scheduleAutoSave(); }}
              onBlur={handleTitleBlur}
              placeholder="例：ログインできない場合の対処方法"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">スラッグ</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); scheduleAutoSave(); }}
              placeholder="例：cannot-login-solution"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">未入力時はタイトルから自動生成</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              カテゴリ
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); scheduleAutoSave(); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 bg-white"
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_id ? `　${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">タグ</label>
            {allTags.length === 0 ? (
              <p className="text-xs text-gray-400">タグ管理でタグを作成してください</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map(tag => {
                  const selected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTagIds(selected
                          ? selectedTagIds.filter(id => id !== tag.id)
                          : [...selectedTagIds, tag.id]
                        );
                        scheduleAutoSave();
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                        selected ? 'ring-2 ring-offset-1 ring-amber-400' : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{ backgroundColor: tag.color ?? '#6B7280', color: '#fff' }}
                    >
                      {tag.name}
                      {selected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lead */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">リード文</label>
            <textarea
              value={lead}
              onChange={(e) => { setLead(e.target.value); scheduleAutoSave(); }}
              rows={3}
              placeholder="記事の概要を簡潔に..."
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">ステータス</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as ArticleStatus); scheduleAutoSave(); }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 bg-white"
            >
              <option value="draft">下書き</option>
              <option value="review">レビュー待ち</option>
              <option value="published">公開</option>
              <option value="unpublished">非公開</option>
            </select>
          </div>

          {/* Published At */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">公開日時</label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
            />
            <p className="mt-1 text-xs text-gray-500">未設定の場合は即時公開</p>
          </div>
        </div>

        {/* Main Content - Preview or Sections */}
        <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
          {showPreview ? (
            <div className="max-w-3xl mx-auto">
              {/* Preview header */}
              <div className="mb-6 pb-4 border-b border-gray-200 flex items-center gap-2 text-xs text-amber-600 font-medium">
                <Eye className="w-3.5 h-3.5" />
                プレビュー（保存前の内容）
              </div>
              <h1 className="text-2xl font-medium text-gray-900 mb-3">
                {title || '（タイトル未入力）'}
              </h1>
              {lead && (
                <p className="text-gray-600 leading-relaxed mb-8 text-base">{lead}</p>
              )}
              {sections.length === 0 ? (
                <p className="text-gray-400 text-sm">セクションがありません</p>
              ) : (
                <div className="space-y-4">
                  {sections.map((s) => (
                    <SectionCard
                      key={s.id}
                      type={s.type}
                      title={s.title}
                      subtitle={s.subtitle}
                      body_md={s.body_md}
                      mediaUrl={s.mediaUrl}
                      mediaProvider={s.mediaProvider}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {sections.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center">
                <p className="text-gray-600 mb-2">セクションがまだありません</p>
                <p className="text-sm text-gray-500">下のボタンからセクションを追加してください</p>
              </div>
            ) : (
              sections.map((section, index) => {
                const typeInfo = getSectionTypeInfo(section.type);
                const isDragging = draggingId === section.id;
                return (
                  // カード全体はドロップターゲット（draggable不要）
                  <div
                    key={section.id}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`bg-white rounded-lg border-2 p-6 transition-all ${
                      isDragging ? 'opacity-50 border-amber-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* グリップのみdraggable — ここだけがドラッグ起点 */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, index, section.id)}
                        onDragEnd={handleDragEnd}
                        className="mt-2 cursor-grab active:cursor-grabbing select-none shrink-0"
                        title="ドラッグして並び替え"
                      >
                        <GripVertical className="w-5 h-5 text-gray-300 hover:text-gray-500 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 ${typeInfo.color} text-white rounded text-xs font-medium`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">セクション {index + 1}</span>
                        </div>

                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleSectionChange(section.id, 'title', e.target.value)}
                          placeholder="セクションタイトル"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 font-medium mb-3"
                        />

                        <input
                          type="text"
                          value={section.subtitle ?? ''}
                          onChange={(e) => handleSectionChange(section.id, 'subtitle', e.target.value)}
                          placeholder="サブタイトル（任意）"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 text-sm mb-3"
                        />

                        <textarea
                          value={section.body_md}
                          onChange={(e) => handleSectionChange(section.id, 'body_md', e.target.value)}
                          placeholder="本文をMarkdown形式で入力..."
                          rows={8}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 font-mono text-sm"
                        />

                        {section.type === 'media' && (
                          <div className="mt-4 space-y-3">
                            {/* タブ */}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, mediaProvider: 'youtube', mediaUrl: '' } : s))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                  section.mediaProvider !== 'image'
                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <Video className="w-4 h-4" />
                                動画URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, mediaProvider: 'image', mediaUrl: '' } : s))}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                  section.mediaProvider === 'image'
                                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <ImageIcon className="w-4 h-4" />
                                画像URL
                              </button>
                            </div>

                            {/* URL入力 */}
                            <input
                              type="text"
                              value={section.mediaUrl ?? ''}
                              onChange={(e) => handleMediaUrlChange(section.id, e.target.value)}
                              placeholder={
                                section.mediaProvider === 'image'
                                  ? '画像URL（例：https://example.com/image.jpg）'
                                  : 'YouTube または Vimeo の URL'
                              }
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 text-sm"
                            />

                            {/* プロバイダー自動検出ラベル */}
                            {section.mediaUrl && section.mediaProvider && section.mediaProvider !== 'image' && (
                              <p className="text-xs text-amber-600">
                                {section.mediaProvider === 'youtube' ? '✓ YouTube' : '✓ Vimeo'} として認識されました
                              </p>
                            )}

                            {/* 動画プレビュー */}
                            {section.mediaUrl && (section.mediaProvider === 'youtube' || section.mediaProvider === 'vimeo') && getEmbedUrl(section.mediaUrl, section.mediaProvider) && (
                              <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-900">
                                <iframe
                                  src={getEmbedUrl(section.mediaUrl, section.mediaProvider)}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}

                            {/* 画像アップロードUI */}
                            {section.mediaProvider === 'image' && (
                              <div className="space-y-2">
                                <label
                                  className={`flex flex-col items-center justify-center gap-2 w-full py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    uploadingId === section.id
                                      ? 'border-amber-300 bg-amber-50'
                                      : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/40'
                                  }`}
                                >
                                  {uploadingId === section.id ? (
                                    <>
                                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                      <span className="text-sm text-amber-600">アップロード中...</span>
                                    </>
                                  ) : (
                                    <>
                                      <ImageIcon className="w-6 h-6 text-gray-400" />
                                      <span className="text-sm text-gray-500">クリックして画像を選択</span>
                                      <span className="text-xs text-gray-400">PNG, JPG, GIF, WebP</span>
                                    </>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleImageUpload(section.id, file);
                                    }}
                                  />
                                </label>
                                {section.mediaUrl && (
                                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                    <img
                                      src={section.mediaUrl}
                                      alt="preview"
                                      className="w-full max-h-64 object-contain"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="mt-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Add Section */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="flex items-center gap-4">
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value as any)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 bg-white"
                >
                  <option value="">セクションタイプを選択...</option>
                  {sectionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddSection}
                  disabled={!newSectionType}
                  className="px-6 py-2.5 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  セクション追加
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
