interface FooterProps {
  variant: 'simple' | 'regular';
  categories?: Array<{ name: string; href: string }>;
  backToSite?: { name: string; href: string };
}

export function Footer({ variant, categories = [], backToSite }: FooterProps) {
  if (variant === 'simple') {
    return (
      <footer className="bg-amber-600 text-gray-900">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-90">
            <a href="#" className="hover:opacity-100 hover:underline transition-all">
              Privacy Policy
            </a>
            <span className="opacity-60">|</span>
            <a href="#" className="hover:opacity-100 hover:underline transition-all">
              Terms
            </a>
            <span className="opacity-60">|</span>
            <a href="/contact" className="hover:opacity-100 hover:underline transition-all">
              Contact
            </a>
          </div>
          <div className="mt-4 text-center text-xs opacity-80">
            © 2026 XXXXXX. All Rights Reserved.
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-amber-600 text-gray-900 shadow-md">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {categories.slice(0, 4).map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity"
            >
              {category.name}
            </a>
          ))}
        </div>
        {backToSite && (
          <a
            href={backToSite.href}
            className="text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity"
          >
            Back to {backToSite.name}
          </a>
        )}
      </div>
    </footer>
  );
}
