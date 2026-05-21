import { useState } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';

interface SearchBoxProps {
  variant?: 'hero' | 'header';
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggest?: boolean;
}

export function SearchBox({
  variant = 'header',
  placeholder = '検索',
  onSearch,
  showSuggest = false
}: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const height = variant === 'hero' ? 'h-12' : 'h-10';
  const maxWidth = variant === 'hero' ? 'max-w-[520px] w-full' : 'flex-1';
  const rounded = 'rounded-md';

  // サンプルサジェストデータ（後で動的に差し替え可能）
  const suggestions = [
    { type: 'recent', icon: Clock, text: 'パスワード変更' },
    { type: 'recent', icon: Clock, text: 'アカウント削除' },
    { type: 'popular', icon: TrendingUp, text: '料金プランの変更方法' },
    { type: 'popular', icon: TrendingUp, text: '2段階認証の設定' },
    { type: 'popular', icon: TrendingUp, text: 'ログインできない時の対処法' }
  ];

  const showSuggestions = showSuggest && isFocused && query.length === 0;

  const handleSearch = () => {
    if (onSearch && query) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  const isActive = isFocused || query.length > 0;

  return (
    <div className={`${maxWidth} flex items-center gap-2`}>
      <div className="relative flex-1">
        {/* Search icon - show for both variants */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Search className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-600' : 'text-gray-500'}`} />
        </div>
        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className={`${height} ${rounded} w-full pl-12 ${query ? 'pr-12' : 'pr-4'} transition-all ${
            isActive
              ? 'bg-white border-2 border-amber-400 shadow-md'
              : 'bg-white/95 backdrop-blur-sm border-2 border-white/50 shadow-sm'
          } text-foreground placeholder:text-gray-500 text-base focus:outline-none focus:ring-4 focus:ring-amber-300/30 relative z-10 [&::-webkit-search-cancel-button]:appearance-none`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        {/* Clear button - inside search box for both variants */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/50"
            type="button"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* サジェストドロップダウン */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-amber-200 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-2">
              {/* 最近の検索 */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  最近の検索
                </p>
              </div>
              {suggestions.filter(s => s.type === 'recent').map((item, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => {
                    setQuery(item.text);
                    if (onSearch) onSearch(item.text);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100/50 transition-all text-left group border-l-2 border-transparent hover:border-amber-400"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-amber-100 transition-colors">
                    <item.icon className="w-4 h-4 text-gray-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-amber-800 transition-colors font-medium">{item.text}</span>
                </button>
              ))}

              {/* 区切り線 */}
              <div className="my-2 border-t-2 border-gray-100"></div>

              {/* 人気の検索 */}
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  人気の検索
                </p>
              </div>
              {suggestions.filter(s => s.type === 'popular').map((item, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => {
                    setQuery(item.text);
                    if (onSearch) onSearch(item.text);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100/50 transition-all text-left group border-l-2 border-transparent hover:border-amber-400"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors">
                    <item.icon className="w-4 h-4 text-amber-600 group-hover:text-amber-700 transition-colors" />
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-amber-800 transition-colors font-medium">{item.text}</span>
                </button>
              ))}
            </div>

            {/* フッター */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-amber-50/30 border-t-2 border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                キーワードを入力してEnterキーで検索
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
