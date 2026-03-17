'use client'
import { useRouter } from 'next/navigation'
const CATS = [
  { slug: 'smartphones', label: 'Phones & Tablets', icon: '📱', count: '2,400+' },
  { slug: 'laptops', label: 'Laptops & Computing', icon: '💻', count: '800+' },
  { slug: 'womens-clothing', label: "Women's Fashion", icon: '👗', count: '5,100+' },
  { slug: 'mens-clothing', label: "Men's Fashion", icon: '👔', count: '3,200+' },
  { slug: 'beauty', label: 'Beauty & Health', icon: '✨', count: '1,900+' },
  { slug: 'fragrances', label: 'Fragrances', icon: '🌸', count: '440+' },
  { slug: 'home-decoration', label: 'Home Decor', icon: '🛋️', count: '1,200+' },
  { slug: 'furniture', label: 'Furniture', icon: '🪑', count: '600+' },
  { slug: 'groceries', label: 'Groceries & Food', icon: '🛒', count: '3,800+' },
  { slug: 'sports-accessories', label: 'Sports & Fitness', icon: '🏋️', count: '900+' },
  { slug: 'skin-care', label: 'Skincare', icon: '💧', count: '700+' },
  { slug: 'tops', label: 'Tops & T-Shirts', icon: '👕', count: '1,600+' },
]
export default function CategoriesPage() {
  const router = useRouter()
  return (
    <div className="page-enter">
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[1280px] mx-auto px-[14px] text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606]">Home</button> › <span className="text-[#1A1A1A]">All Categories</span>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-[14px] pb-8">
        <div className="bg-white rounded-[6px] p-[18px] shadow-[var(--sh)]">
          <h1 className="text-[16px] font-[800] mb-4 pb-[10px] border-b border-[#E8E8E8]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>All Categories</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATS.map((c) => (
              <button key={c.slug} onClick={() => router.push(`/buyer/category/${c.slug}`)}
                className="flex flex-col items-center gap-2 p-4 rounded-[10px] border border-[#E8E8E8] hover:border-[#F85606] hover:bg-[#FFF3EE] transition-all group">
                <span className="text-3xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-[13px] font-[700] text-center leading-[1.2]">{c.label}</span>
                <span className="text-[10px] text-[#ABABAB] font-[600]">{c.count} products</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
