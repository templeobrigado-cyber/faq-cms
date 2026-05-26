import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { HelpCircle } from 'lucide-react'
import { Header } from '../Header'
import { Footer } from '../Footer'
import { CategoryCard } from '../CategoryCard'
import { getRootCategories } from '../../../lib/services/categories'
import { ICON_MAP } from '../../../lib/icons'
import type { Category } from '../../../lib/types'

export function TopPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getRootCategories().then(setCategories)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        variant="hero"
        onSearch={q => navigate(`/search?q=${encodeURIComponent(q)}`)}
      />

      <main className="flex-1 bg-background">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {categories.map(cat => (
              <CategoryCard
                key={cat.id}
                icon={ICON_MAP[cat.icon] ?? HelpCircle}
                name={cat.name}
                href={`/category/${cat.slug}`}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
