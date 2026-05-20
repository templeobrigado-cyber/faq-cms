import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  href: string;
  onClick?: () => void;
}

export function CategoryCard({ icon: Icon, name, href, onClick }: CategoryCardProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className="block w-full bg-white border-2 border-gray-200 rounded-lg hover:border-amber-400 hover:shadow-md transition-all"
    >
      <div className="flex flex-col items-center justify-center gap-5 py-10 px-6">
        <Icon className="w-20 h-20 text-amber-600" strokeWidth={1.5} />
        <h3 className="text-center text-lg">{name}</h3>
        <button className="mt-1 px-6 py-2.5 bg-amber-600 text-gray-900 rounded hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm">
          See Articles
        </button>
      </div>
    </a>
  );
}
