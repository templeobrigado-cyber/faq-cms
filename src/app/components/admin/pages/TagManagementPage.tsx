import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/auth';
import { AccessDenied } from '../AccessDenied';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, Loader2, Tag as TagIcon } from 'lucide-react';
import { getTags, getTagUsageCounts, createTag, updateTag, deleteTag } from '../../../../lib/services/tags';
import { ICON_MAP, ICON_OPTIONS } from '../../../../lib/icons';
import type { Tag } from '../../../../lib/types';

const COLOR_PALETTE = [
  ['#6B7280', '#374151', '#111827', '#EF4444', '#F97316', '#EAB308'],
  ['#22C55E', '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'],
  ['#FCA5A5', '#FCD34D', '#6EE7B7', '#93C5FD', '#C4B5FD', '#F9A8D4'],
  ['#DC2626', '#D97706', '#16A34A', '#0284C7', '#7C3AED', '#DB2777'],
  ['#FEF2F2', '#FFFBEB', '#F0FDF4', '#EFF6FF', '#F5F3FF', '#FDF2F8'],
  ['#FF9D1A', '#E68A00', '#B36B00', '#1F2937', '#4B5563', '#9CA3AF'],
];

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || `tag-${Date.now()}`;
}

export function TagManagementPage() {
  const { can } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'unused'>('all');
  const [showPanel, setShowPanel] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // フォーム state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formColor, setFormColor] = useState('#3B82F6');
  const [formIcon, setFormIcon] = useState('Tag');

  const load = async () => {
    setLoading(true);
    const [tagList, counts] = await Promise.all([getTags(), getTagUsageCounts()]);
    setTags(tagList);
    setUsageCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormColor('#3B82F6');
    setFormIcon('Tag');
    setShowPanel(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setFormColor(tag.color ?? '#3B82F6');
    setFormIcon(tag.icon ?? 'Tag');
    setShowPanel(true);
  };

  const handleClose = () => { setShowPanel(false); setEditingId(null); };

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingId) setFormSlug(generateSlug(name));
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    const input = {
      name: formName.trim(),
      slug: formSlug || generateSlug(formName),
      color: formColor,
      icon: formIcon,
    };

    if (editingId) {
      await updateTag(editingId, input);
    } else {
      await createTag(input);
    }

    await load();
    handleClose();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTag(id);
    await load();
    setDeleteConfirmId(null);
  };

  const filtered = tags.filter(tag => {
    const matchSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const count = usageCounts[tag.id] ?? 0;
    const matchFilter =
      filterStatus === 'all' ||
      (filterStatus === 'used' && count > 0) ||
      (filterStatus === 'unused' && count === 0);
    return matchSearch && matchFilter;
  });

  if (!can('tag.manage')) return <AccessDenied />;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">タグ管理</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          タグを追加
        </button>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className={showPanel ? 'flex-1' : 'w-full'}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="タグ名で検索"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">絞り込み：</span>
                {(['all', 'used', 'unused'] as const).map(v => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="filter"
                      value={v}
                      checked={filterStatus === v}
                      onChange={() => setFilterStatus(v)}
                      className="text-amber-600"
                    />
                    <span className="text-gray-700">
                      {v === 'all' ? 'すべて' : v === 'used' ? '利用中' : '未使用'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">読み込み中...</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">タグ</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">スラッグ</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-600">利用件数</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tag => {
                    const Icon = ICON_MAP[tag.icon ?? ''] ?? TagIcon;
                    const count = usageCounts[tag.id] ?? 0;
                    return (
                      <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium text-white"
                            style={{ backgroundColor: tag.color ?? '#6B7280' }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {tag.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{tag.slug}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">{count}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(tag)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tag.id)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                        タグがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
              全 {filtered.length} 件
            </div>
          </div>
        </div>

        {/* Edit Panel */}
        {showPanel && (
          <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm shrink-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">{editingId ? 'タグを編集' : 'タグを追加'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto">
              {/* プレビュー */}
              <div className="flex items-center justify-center py-3 bg-gray-50 rounded-lg">
                {(() => { const Icon = ICON_MAP[formIcon] ?? TagIcon; return (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-white"
                    style={{ backgroundColor: formColor }}
                  >
                    <Icon className="w-4 h-4" />
                    {formName || 'タグ名'}
                  </span>
                ); })()}
              </div>

              {/* タグ名 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  タグ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="例：初心者向け"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
                />
              </div>

              {/* スラッグ */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">スラッグ</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 font-mono bg-gray-50"
                />
              </div>

              {/* アイコン */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">アイコン</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ICON_OPTIONS.map(name => {
                    const Icon = ICON_MAP[name];
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => setFormIcon(name)}
                        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${
                          formIcon === name
                            ? 'border-amber-400 bg-amber-50 text-amber-600'
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] truncate w-full text-center leading-none">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* カラー */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">カラー</label>
                <div className="space-y-1.5">
                  {COLOR_PALETTE.map((row, i) => (
                    <div key={i} className="flex gap-1.5">
                      {row.map(color => (
                        <button
                          key={color}
                          onClick={() => setFormColor(color)}
                          className={`w-9 h-9 rounded border-2 transition-all hover:scale-110 ${
                            formColor === color ? 'border-gray-900 ring-2 ring-amber-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-200 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 text-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="px-4 py-2 bg-amber-600 text-gray-900 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? '更新' : '追加'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 削除確認 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <h3 className="font-medium text-gray-900">タグを削除しますか？</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">記事に紐づいているタグも削除されます。</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
