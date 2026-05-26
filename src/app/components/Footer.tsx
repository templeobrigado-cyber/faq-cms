export function Footer() {
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
