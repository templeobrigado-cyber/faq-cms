import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SearchBox } from './SearchBox';
import { getSettings } from '../../lib/services/settings';

const DEFAULT_PLACEHOLDER = '検索（例：サイトレポートとは？）';

interface HeaderProps {
  variant: 'hero' | 'compact';
  onBack?: () => void;
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

export function Header({ variant, onBack, onSearch, initialQuery }: HeaderProps) {
  const [placeholder, setPlaceholder] = useState(DEFAULT_PLACEHOLDER);

  useEffect(() => {
    getSettings().then(s => {
      if (s.search_placeholder) setPlaceholder(s.search_placeholder);
    });
  }, []);

  if (variant === 'hero') {
    return (
      <header className="bg-amber-600 text-gray-900 shadow-md">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12">
          {/* Top bar */}
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-medium">FAQ-CMS</h1>
              <span className="text-sm opacity-95">FAQ よくあるご質問</span>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-2 rounded border border-white/30 hover:bg-white/10 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>FAQ-CMS</span>
              </button>
            )}
          </div>

          {/* Hero section */}
          <div className="py-14 pb-20 flex flex-col items-center text-center">
            <h2 className="text-3xl font-black mb-10 tracking-wide">
              どんなことでお困りですか？
            </h2>
            <SearchBox
              variant="hero"
              placeholder={placeholder}
              onSearch={onSearch}
              showSuggest={true}
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-amber-600 text-gray-900 shadow-md">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <h1 className="text-xl font-medium">FAQ-CMS</h1>
          <span className="text-sm opacity-95">FAQ よくあるご質問</span>
        </div>
        <SearchBox variant="header" placeholder={placeholder} onSearch={onSearch} showSuggest={true} initialValue={initialQuery} />
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 rounded border border-white/30 hover:bg-white/10 transition-colors shrink-0 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>FAQ-CMS</span>
          </button>
        )}
      </div>
    </header>
  );
}
