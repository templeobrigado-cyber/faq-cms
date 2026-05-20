import { useState, useEffect } from 'react';
import { Plus, GripVertical, Edit, Trash2, ChevronDown, ChevronRight, X, AlertTriangle, Loader2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../../../lib/services/categories';
import { ICON_MAP, ICON_OPTIONS } from '../../../../lib/icons';
import { useAuth } from '../../../../lib/auth';
import { AccessDenied } from '../AccessDenied';
import type { Category, CreateCategoryInput } from '../../../../lib/types';

interface TreeCategory extends Category {
  children: TreeCategory[];
  isExpanded: boolean;
}

function buildTree(flat: Category[]): TreeCategory[] {
  const map = new Map<string, TreeCategory>();
  flat.forEach(c => map.set(c.id, { ...c, children: [], isExpanded: true }));
  const roots: TreeCategory[] = [];
  flat.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function flattenTree(tree: TreeCategory[]): TreeCategory[] {
  const result: TreeCategory[] = [];
  const walk = (nodes: TreeCategory[]) => nodes.forEach(n => { result.push(n); walk(n.children); });
  walk(tree);
  return result;
}

export function CategoryManagementPage() {
  const { can } = useAuth();
  const [tree, setTree] = useState<TreeCategory[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // フォーム state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formIcon, setFormIcon] = useState('HelpCircle');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formOrder, setFormOrder] = useState(1);

  const load = async () => {
    setLoading(true);
    const cats = await getCategories();
    setAllCategories(cats);
    setTree(buildTree(cats));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = (parentId: string | null = null) => {
    setEditingId(null);
    setFormName('');
    setFormSlug('');
    setFormIcon('HelpCircle');
    setFormParentId(parentId ?? '');
    setFormOrder(1);
    setShowPanel(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon);
    setFormParentId(cat.parent_id ?? '');
    setFormOrder(cat.order);
    setShowPanel(true);
  };

  const handleClose = () => {
    setShowPanel(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formSlug.trim()) return;
    setSaving(true);

    const input: CreateCategoryInput = {
      name: formName.trim(),
      slug: formSlug.trim(),
      icon: formIcon,
      parent_id: formParentId || null,
      order: formOrder,
    };

    if (editingId) {
      await updateCategory(editingId, input);
    } else {
      await createCategory(input);
    }

    await load();
    handleClose();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    await load();
    setDeleteConfirmId(null);
  };

  const toggleExpand = (id: string) => {
    const toggle = (nodes: TreeCategory[]): TreeCategory[] =>
      nodes.map(n => n.id === id
        ? { ...n, isExpanded: !n.isExpanded }
        : { ...n, children: toggle(n.children) }
      );
    setTree(toggle(tree));
  };

  const renderNode = (node: TreeCategory, level: number = 0) => (
    <div key={node.id}>
      <div
        className="group flex items-center gap-3 py-3 pr-4 hover:bg-gray-50 border-b border-gray-100 transition-colors"
        style={{ paddingLeft: `${20 + level * 32}px` }}
      >
        <GripVertical className="w-4 h-4 text-gray-300 cursor-move shrink-0" />

        <button
          onClick={() => node.children.length > 0 && toggleExpand(node.id)}
          className="w-5 h-5 flex items-center justify-center shrink-0"
        >
          {node.children.length > 0 ? (
            node.isExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <span className="w-4" />
          )}
        </button>

        <span className="flex-1 text-sm font-medium text-gray-900">{node.name}</span>
        <span className="text-xs text-gray-400 font-mono">{node.slug}</span>
        {(() => { const Icon = ICON_MAP[node.icon]; return Icon ? <Icon className="w-4 h-4 text-gray-400 shrink-0" /> : null; })()}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => openEdit(node)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteConfirmId(node.id)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openAdd(node.id)}
            className="px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded transition-colors"
          >
            + 子カテゴリ
          </button>
        </div>
      </div>
      {node.isExpanded && node.children.map(child => renderNode(child, level + 1))}
    </div>
  );

  const rootCategories = allCategories.filter(c => !c.parent_id);

  if (!can('category.manage')) return <AccessDenied />;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">カテゴリ管理</h1>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          カテゴリを追加
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tree */}
        <div className={showPanel ? 'flex-1' : 'w-full'}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">読み込み中...</div>
            ) : tree.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">カテゴリがありません</div>
            ) : (
              <>
                {tree.map(node => renderNode(node))}
                <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
                  全 {flattenTree(tree).length} カテゴリ
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        {showPanel && (
          <div className="w-80 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm shrink-0">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-medium text-gray-900">
                {editingId ? 'カテゴリを編集' : 'カテゴリを追加'}
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  カテゴリ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="例：アカウント設定"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  スラッグ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  placeholder="例：account-settings"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-300/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">親カテゴリ</label>
                <select
                  value={formParentId}
                  onChange={e => setFormParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="">なし（トップレベル）</option>
                  {rootCategories
                    .filter(c => c.id !== editingId)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>

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
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] leading-none text-center truncate w-full">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">表示順</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={e => setFormOrder(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                />
                <p className="mt-1 text-xs text-gray-400">小さい数字ほど上に表示</p>
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
                disabled={saving || !formName.trim() || !formSlug.trim()}
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
              <h3 className="font-medium text-gray-900">カテゴリを削除しますか？</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              子カテゴリがある場合は親カテゴリへの参照が解除されます。記事のカテゴリはnullになります。
            </p>
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
