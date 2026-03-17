'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Package, ShoppingCart, BarChart2,
  Star, Settings, LogOut, Menu, X, Plus, Edit2, Trash2,
  Upload, Send, MessageSquare, Check, XCircle, TrendingUp,
  DollarSign, ChevronRight, AlertCircle,
} from 'lucide-react'
import { vendorApi, profileApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { ngn, fileToBase64, cn } from '@/lib/utils'
import type { VendorProduct, IncomingOrder, VendorAnalytic, ChatMessage } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashStats { orders: number; revenue: number; products: number; earnings: number }

// ─── Status pill helper ───────────────────────────────────────────────────────
const STATUS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  shipped: 'bg-blue-50 text-blue-700 border border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
}
const pill = (s: string) => STATUS[s?.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border border-gray-200'

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'spotlight', label: 'Spotlight', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function Sidebar({ active, onChange, onLogout, user }: { active: string; onChange: (t: string) => void; onLogout: () => void; user: { name?: string; email?: string } | null }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="text-[20px] font-[800] text-[#00853D]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>
          Vend<span className="text-[#FFC200]">oor</span>
        </div>
        <p className="text-[11px] text-gray-400 font-[600] mt-[2px]">Vendor Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-[2px]">
        <p className="text-[10px] font-[700] uppercase tracking-[0.1em] text-gray-400 px-3 mb-2">Main</p>
        {NAV.slice(0, 4).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={cn('w-full flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[14px] font-[600] transition-all',
              active === id ? 'bg-[#E8F7EF] text-[#00853D] font-[700]' : 'text-gray-600 hover:bg-gray-50')}>
            <Icon size={17} />
            {label}
            {active === id && <ChevronRight size={13} className="ml-auto" />}
          </button>
        ))}
        <p className="text-[10px] font-[700] uppercase tracking-[0.1em] text-gray-400 px-3 mb-2 mt-5">Store</p>
        {NAV.slice(4).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={cn('w-full flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[14px] font-[600] transition-all',
              active === id ? 'bg-[#E8F7EF] text-[#00853D] font-[700]' : 'text-gray-600 hover:bg-gray-50')}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      {/* Profile + logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-[8px] bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-[8px] bg-[#E8F7EF] flex items-center justify-center text-base flex-shrink-0">🏪</div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-[700] truncate">{user?.name ?? 'My Store'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-[8px] transition-colors font-[600]">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState<DashStats>({ orders: 0, revenue: 0, products: 0, earnings: 0 })
  const [orders, setOrders] = useState<IncomingOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([vendorApi.dashboard(), vendorApi.earnings(), vendorApi.incomingOrders()])
      .then(([d, e, o]) => {
        setStats({ orders: d.data.orders ?? 0, revenue: d.data.revenue ?? 0, products: d.data.products ?? 0, earnings: e.data.earnings ?? 0 })
        setOrders((o.data.orders ?? []).slice(0, 6))
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const cards = [
    { icon: '📦', label: 'Total Orders', value: stats.orders.toLocaleString(), color: '#0066CC', bg: '#EEF5FF' },
    { icon: '💰', label: 'Revenue', value: ngn(stats.revenue), color: '#F85606', bg: '#FFF3EE' },
    { icon: '🛍️', label: 'Products', value: stats.products.toLocaleString(), color: '#7C3AED', bg: '#F5F3FF' },
    { icon: '💳', label: 'Available Earnings', value: ngn(stats.earnings), color: '#00853D', bg: '#E8F7EF' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-[800] mb-1" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Dashboard Overview</h2>
        <p className="text-[13px] text-gray-500">Here's how your store is performing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-3" style={{ background: c.bg }}>{c.icon}</div>
            <p className="text-[12px] font-[700] text-gray-500 uppercase tracking-[.05em]">{c.label}</p>
            {loading
              ? <div className="skeleton h-7 w-3/4 mt-1 rounded-[6px]" />
              : <p className="text-[22px] font-[800] mt-1" style={{ color: c.color, fontFamily: 'var(--font-syne, system-ui)' }}>{c.value}</p>}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-[700] text-[16px]">Recent Orders</h3>
          <span className="text-[12px] text-gray-400">{orders.length} orders</span>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-[8px]" />)}</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400"><ShoppingCart size={40} className="mx-auto mb-3 opacity-40" /><p className="font-[600]">No orders yet</p><p className="text-[13px] mt-1">Orders will appear when buyers purchase your products</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50">
                <tr>{['Order ID', 'Customer', 'Qty', 'Amount', 'Status', 'Date'].map((h) => <th key={h} className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_uuid} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-[700] text-blue-600 text-[12px]">{o.order_uuid.slice(0, 12)}…</td>
                    <td className="px-5 py-3 font-[500]">{o.customer_name}</td>
                    <td className="px-5 py-3 text-gray-500">×{o.quantity}</td>
                    <td className="px-5 py-3 font-[800] text-[#F85606]">{ngn(o.price * o.quantity)}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-[700] px-[10px] py-[3px] rounded-full ${pill(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-gray-400 text-[12px]">{o.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<Partial<VendorProduct> | false>(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categories: '', images: [] as string[] })

  const load = useCallback(() => {
    setLoading(true)
    vendorApi.myProducts().then((r) => setProducts(r.data.products ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setForm({ name: '', description: '', price: '', stock: '', categories: '', images: [] }); setModal({}) }
  const openEdit = (p: VendorProduct) => {
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price), stock: String(p.stock), categories: (p.categories ?? []).join(', '), images: p.images ?? [] })
    setModal(p)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const b64 = await fileToBase64(file)
      const r = await profileApi.uploadImage(b64)
      setForm((f) => ({ ...f, images: [...f.images, r.data.imagePath] }))
      toast.success('Image uploaded!')
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const isEdit = !!(modal && (modal as VendorProduct).product_uuid)
      if (isEdit) {
        await vendorApi.editProduct({ product_uuid: (modal as VendorProduct).product_uuid, name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock) || 0 })
        toast.success('Product updated!')
      } else {
        await vendorApi.addProduct({ name: form.name, description: form.description, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, images: form.images, categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean) })
        toast.success('Product added!')
      }
      setModal(false)
      load()
    } catch { toast.error('Failed to save. Try again.') } finally { setSaving(false) }
  }

  const handleDelete = async (uuid: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try { await vendorApi.deleteProduct(uuid); setProducts((p) => p.filter((x) => x.product_uuid !== uuid)); toast.success('Deleted') }
    catch { toast.error('Delete failed') }
  }

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>My Products</h2>
          <p className="text-[13px] text-gray-500">{products.length} total products listed</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-[10px] bg-[#00853D] text-white text-[13px] font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your products…"
          className="w-full pl-4 pr-4 py-[11px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors bg-white" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <div key={i} className="skeleton h-[180px] rounded-[12px]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[14px] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
          <Package size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-[700] text-[16px] mb-2">{search ? 'No products match your search' : 'No products yet'}</p>
          {!search && <><p className="text-[14px] text-gray-500 mb-5">Start listing products to attract buyers on Vendoor</p>
          <button onClick={openAdd} className="px-6 py-[11px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors">Add First Product</button></>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.product_uuid} className="bg-white rounded-[12px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 group">
              <div className="h-[130px] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl opacity-20">📦</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(p.product_uuid)} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[13px] font-[700] truncate mb-1">{p.name}</p>
                <p className="text-[15px] font-[900] text-[#00853D]">{ngn(p.price)}</p>
                <p className="text-[11px] text-gray-400 mt-[2px]">Stock: {p.stock}</p>
                {p.categories?.length ? <p className="text-[10px] text-gray-400 mt-1 truncate">{p.categories.join(', ')}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal !== false && (
        <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[20px] w-full max-w-[520px] p-7 relative my-4 shadow-2xl">
            <button onClick={() => setModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
            <h3 className="text-[20px] font-[800] mb-1" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>
              {(modal as VendorProduct).product_uuid ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[13px] text-gray-500 mb-5">{(modal as VendorProduct).product_uuid ? 'Update the product details below.' : 'Fill in the details to list your product on Vendoor.'}</p>

            <div className="space-y-4">
              {[
                { label: 'Product Name *', key: 'name', placeholder: 'e.g. Chicken Burger Deluxe' },
                { label: 'Price (₦) *', key: 'price', placeholder: '3500', type: 'number' },
                { label: 'Stock Quantity', key: 'stock', placeholder: '20', type: 'number' },
                { label: 'Categories (comma-separated)', key: 'categories', placeholder: 'food, fastfood, burger' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">{label}</label>
                  <input type={type ?? 'text'} value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-[11px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Describe your product in detail…"
                  className="w-full px-4 py-[11px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Product Images</label>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-[10px] text-[13px] text-gray-500 font-[600] hover:border-[#00853D] hover:text-[#00853D] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <Upload size={15} /> {uploading ? 'Uploading…' : 'Click to upload image'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-14 h-14 rounded-[6px] object-cover border border-gray-200" />
                        <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-[13px] bg-gray-100 text-gray-600 font-[700] rounded-[10px] hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-[13px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : (modal as VendorProduct).product_uuid ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<IncomingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [chatOrder, setChatOrder] = useState<IncomingOrder | null>(null)

  useEffect(() => {
    vendorApi.incomingOrders().then((r) => setOrders(r.data.orders ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const act = async (fn: () => Promise<unknown>, uuid: string, newStatus: string) => {
    try { await fn(); setOrders((prev) => prev.map((o) => o.order_uuid === uuid ? { ...o, status: newStatus } : o)); toast.success(`Order ${newStatus}`) }
    catch { toast.error('Action failed. Try again.') }
  }

  const FILTERS = ['all', 'pending', 'accepted', 'shipped', 'delivered', 'rejected']
  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Incoming Orders</h2>
        <p className="text-[13px] text-gray-500">{orders.length} total orders received</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-[7px] rounded-full text-[12px] font-[700] whitespace-nowrap transition-all capitalize',
              filter === f ? 'bg-[#00853D] text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-[#00853D]')}>
            {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-[10px]" />)}</div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-[14px] p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
          <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-[700]">No {filter !== 'all' ? filter : ''} orders</p>
        </div>
      ) : (
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50">
                <tr>{['Order ID', 'Customer', 'Qty', 'Amount', 'Status', 'Date', 'Actions'].map((h) => <th key={h} className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">{h}</th>)}</tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.order_uuid} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-[700] text-blue-600 text-[12px]">{o.order_uuid.slice(0, 12)}…</td>
                    <td className="px-5 py-3 font-[500]">{o.customer_name}</td>
                    <td className="px-5 py-3 text-gray-500">×{o.quantity}</td>
                    <td className="px-5 py-3 font-[800] text-[#F85606]">{ngn(o.price * o.quantity)}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-[700] px-[10px] py-[3px] rounded-full ${pill(o.status)}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-gray-400 text-[12px]">{o.created_at}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {o.status === 'pending' && (<>
                          <button onClick={() => act(() => vendorApi.acceptOrder(o.order_uuid), o.order_uuid, 'accepted')} title="Accept" className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-[6px] flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"><Check size={12} /></button>
                          <button onClick={() => act(() => vendorApi.rejectOrder(o.order_uuid), o.order_uuid, 'rejected')} title="Reject" className="w-7 h-7 bg-red-50 text-red-500 rounded-[6px] flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><XCircle size={12} /></button>
                        </>)}
                        {o.status === 'accepted' && (
                          <button onClick={() => act(() => vendorApi.updateDelivery(o.order_uuid, 'shipped'), o.order_uuid, 'shipped')} className="px-2 py-[3px] bg-blue-50 text-blue-600 text-[10px] font-[700] rounded-[6px] hover:bg-blue-500 hover:text-white transition-colors">Ship</button>
                        )}
                        {o.status === 'shipped' && (
                          <button onClick={() => act(() => vendorApi.updateDelivery(o.order_uuid, 'delivered'), o.order_uuid, 'delivered')} className="px-2 py-[3px] bg-emerald-50 text-emerald-600 text-[10px] font-[700] rounded-[6px] hover:bg-emerald-500 hover:text-white transition-colors">Delivered</button>
                        )}
                        <button onClick={() => setChatOrder(o)} title="Message customer" className="w-7 h-7 bg-gray-100 text-gray-500 rounded-[6px] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"><MessageSquare size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {chatOrder && <ChatModal order={chatOrder} onClose={() => setChatOrder(null)} />}
    </div>
  )
}

// ─── CHAT MODAL ───────────────────────────────────────────────────────────────
function ChatModal({ order, onClose }: { order: IncomingOrder; onClose: () => void }) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    vendorApi.getChat(order.order_uuid).then((r) => setMessages(r.data.messages ?? [])).catch(() => {})
  }, [order.order_uuid])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user?.uuid) return
    setSending(true)
    const msg: ChatMessage = { order_uuid: order.order_uuid, sender_uuid: user.uuid, receiver_uuid: order.product_uuid, message: text.trim(), created_at: new Date().toISOString() }
    try {
      await vendorApi.sendMessage({ order_uuid: order.order_uuid, sender_uuid: user.uuid, receiver_uuid: order.product_uuid, message: text.trim() })
      setMessages((m) => [...m, msg]); setText('')
    } catch { toast.error('Send failed') } finally { setSending(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-[460px] flex flex-col shadow-2xl" style={{ maxHeight: '80vh' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-[800] text-[15px]">{order.customer_name}</p>
            <p className="text-[12px] text-gray-400">Order {order.order_uuid.slice(0, 12)}…</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-[8px] bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[200px]">
          {messages.length === 0 && <p className="text-[13px] text-gray-400 text-center py-6">No messages yet. Start the conversation!</p>}
          {messages.map((m, i) => {
            const isMe = m.sender_uuid === user?.uuid
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-[9px] rounded-[14px] text-[13px] ${isMe ? 'bg-[#00853D] text-white rounded-br-[4px]' : 'bg-gray-100 text-gray-800 rounded-bl-[4px]'}`}>
                  <p>{m.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-3 py-[10px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors" />
          <button onClick={handleSend} disabled={sending || !text.trim()}
            className="w-10 h-10 bg-[#00853D] text-white rounded-[10px] flex items-center justify-center hover:bg-[#006b31] disabled:opacity-50 transition-colors">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<VendorAnalytic[]>([])
  const [earnings, setEarnings] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    Promise.all([vendorApi.analytics(), vendorApi.earnings()])
      .then(([a, e]) => { setAnalytics(a.data.analytics ?? []); setEarnings(e.data.earnings ?? 0) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (amt > earnings) { toast.error('Amount exceeds available earnings'); return }
    setWithdrawing(true)
    try {
      await vendorApi.withdraw(amt)
      toast.success('Withdrawal requested! Processing in 1-2 business days.')
      setEarnings((e) => e - amt)
      setWithdrawAmount('')
    } catch { toast.error('Withdrawal failed. Try again.') } finally { setWithdrawing(false) }
  }

  const maxRev = Math.max(...analytics.map((d) => d.revenue), 1)
  const totalRev = analytics.reduce((s, d) => s + d.revenue, 0)
  const avgRev = analytics.length ? totalRev / analytics.length : 0

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Sales Analytics</h2>
        <p className="text-[13px] text-gray-500">Track your revenue and earnings performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <DollarSign size={20} />, label: 'Total Revenue', value: ngn(totalRev), color: '#F85606', bg: '#FFF3EE' },
          { icon: <TrendingUp size={20} />, label: 'Avg. Daily Revenue', value: ngn(Math.round(avgRev)), color: '#0066CC', bg: '#EEF5FF' },
          { icon: <DollarSign size={20} />, label: 'Available Earnings', value: ngn(earnings), color: '#00853D', bg: '#E8F7EF' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-[14px] p-5 shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100">
            <div className="w-9 h-9 rounded-[8px] flex items-center justify-center mb-3" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <p className="text-[12px] font-[700] text-gray-500 uppercase tracking-[.05em]">{c.label}</p>
            {loading ? <div className="skeleton h-6 w-3/4 mt-1 rounded" /> : <p className="text-[20px] font-[800] mt-1" style={{ color: c.color, fontFamily: 'var(--font-syne, system-ui)' }}>{c.value}</p>}
          </div>
        ))}
      </div>

      {/* Withdraw */}
      <div className="bg-gradient-to-r from-[#00853D] to-[#006b31] rounded-[14px] p-6">
        <h3 className="text-white font-[800] text-[17px] mb-1">Withdraw Earnings</h3>
        <p className="text-white/70 text-[13px] mb-4">Available: <strong className="text-white">{ngn(earnings)}</strong></p>
        <div className="flex gap-3 flex-wrap">
          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Amount to withdraw"
            className="flex-1 min-w-[150px] px-4 py-[11px] bg-white/20 border border-white/30 rounded-[10px] text-white placeholder-white/60 text-[14px] outline-none focus:bg-white/30 transition-colors" />
          <button onClick={handleWithdraw} disabled={withdrawing || !withdrawAmount}
            className="px-6 py-[11px] bg-[#FFC200] text-black font-[800] text-[13px] rounded-[10px] hover:bg-[#e6af00] transition-colors disabled:opacity-60">
            {withdrawing ? 'Processing…' : 'Withdraw →'}
          </button>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-[#00853D]" />
          <h3 className="font-[700] text-[15px]">Revenue by Date</h3>
          <span className="text-[12px] text-gray-400 ml-auto">{analytics.length} data points</span>
        </div>
        {loading ? <div className="skeleton h-[160px] rounded-[8px]" />
          : analytics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[160px] text-gray-400">
              <BarChart2 size={40} className="mb-3 opacity-30" />
              <p className="font-[600]">No sales data yet</p><p className="text-[13px]">Data appears after your first sale</p>
            </div>
          ) : (
            <div className="flex items-end gap-[4px] h-[160px]">
              {analytics.slice(-20).map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-[700] px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                    {ngn(d.revenue)}
                  </div>
                  <div className="w-full bg-[#00853D] rounded-t-[4px] hover:bg-[#006b31] transition-colors cursor-pointer"
                    style={{ height: `${Math.max((d.revenue / maxRev) * 100, 4)}%`, minHeight: '4px' }} />
                  <span className="text-[8px] text-gray-400 font-[700]">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Table */}
      {analytics.length > 0 && (
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-[700] text-[15px]">Revenue Breakdown</h3></div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr><th className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">Date</th><th className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">Revenue</th><th className="text-left px-5 py-3 text-[11px] text-gray-500 font-[700] uppercase tracking-[.04em]">Bar</th></tr>
              </thead>
              <tbody>
                {analytics.map((d) => (
                  <tr key={d.date} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-600">{d.date}</td>
                    <td className="px-5 py-3 font-[800] text-[#00853D]">{ngn(d.revenue)}</td>
                    <td className="px-5 py-3 w-[120px]"><div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-[#00853D] rounded-full" style={{ width: `${(d.revenue / maxRev) * 100}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
function MessagesTab() {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<ChatMessage[]>([])
  const [selected, setSelected] = useState<ChatMessage | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    vendorApi.recentChats().then((r) => setChats(r.data.messages ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected?.order_uuid) return
    vendorApi.getChat(selected.order_uuid).then((r) => setMessages(r.data.messages ?? [])).catch(() => {})
  }, [selected?.order_uuid])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !selected || !user?.uuid) return
    setSending(true)
    const receiver = selected.sender_uuid === user.uuid ? selected.receiver_uuid : selected.sender_uuid
    try {
      await vendorApi.sendMessage({ order_uuid: selected.order_uuid, sender_uuid: user.uuid, receiver_uuid: receiver, message: text.trim() })
      setMessages((m) => [...m, { order_uuid: selected.order_uuid, sender_uuid: user.uuid, receiver_uuid: receiver, message: text.trim(), created_at: new Date().toISOString() }])
      setText('')
    } catch { toast.error('Send failed') } finally { setSending(false) }
  }

  const uniqueChats = Object.values(chats.reduce((acc, m) => { acc[m.order_uuid] = m; return acc }, {} as Record<string, ChatMessage>))

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Messages</h2>
        <p className="text-[13px] text-gray-500">Chat with your customers about their orders</p>
      </div>

      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 overflow-hidden" style={{ height: 560 }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-[240px] border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-[700] text-[14px]">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 rounded-[8px]" />)}</div>}
              {!loading && uniqueChats.length === 0 && (
                <div className="p-6 text-center text-gray-400">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-[13px]">No conversations yet</p>
                </div>
              )}
              {uniqueChats.map((c) => (
                <button key={c.order_uuid} onClick={() => setSelected(c)}
                  className={cn('w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-left transition-colors', selected?.order_uuid === c.order_uuid && 'bg-[#E8F7EF]')}>
                  <div className="w-8 h-8 rounded-full bg-[#E8F7EF] flex items-center justify-center text-sm flex-shrink-0 mt-[1px]">💬</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-[700] truncate">Order {c.order_uuid.slice(0, 8)}…</p>
                    <p className="text-[11px] text-gray-400 truncate">{c.message}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {selected ? (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-5 py-3 border-b border-gray-100">
                <p className="font-[700] text-[14px]">Order {selected.order_uuid.slice(0, 16)}…</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {messages.map((m, i) => {
                  const isMe = m.sender_uuid === user?.uuid
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-[9px] rounded-[14px] text-[13px] ${isMe ? 'bg-[#00853D] text-white rounded-br-[4px]' : 'bg-gray-100 text-gray-800 rounded-bl-[4px]'}`}>
                        <p>{m.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(m.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type message…"
                  className="flex-1 px-3 py-[10px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors" />
                <button onClick={handleSend} disabled={sending || !text.trim()}
                  className="w-10 h-10 bg-[#00853D] text-white rounded-[10px] flex items-center justify-center hover:bg-[#006b31] disabled:opacity-50 transition-colors">
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-[600]">Select a conversation</p>
                <p className="text-[13px] mt-1">Choose from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SPOTLIGHT ────────────────────────────────────────────────────────────────
function SpotlightTab() {
  const [active, setActive] = useState(false)
  return (
    <div className="max-w-[620px]">
      <div className="mb-5">
        <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Spotlight</h2>
        <p className="text-[13px] text-gray-500">Boost your store visibility across the Vendoor platform</p>
      </div>

      <div className={`rounded-[18px] p-7 text-white mb-5 ${active ? 'bg-gradient-to-br from-[#00853D] to-[#006b31]' : 'bg-gradient-to-br from-[#1a1a2e] to-[#0f3460]'}`}>
        <div className="text-3xl mb-3">{active ? '⭐' : '🚀'}</div>
        <h3 className="text-[22px] font-[800] mb-2" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>
          {active ? "You're a Spotlight Vendor!" : 'Boost Your Store with Spotlight'}
        </h3>
        <p className="text-white/80 text-[14px] leading-[1.7] mb-5">
          {active
            ? 'Your store is prominently featured on the Vendoor homepage, search results, and category pages. Enjoy 10x more visibility!'
            : 'Get featured on the homepage, rank higher in search results, and reach thousands more campus buyers every day.'}
        </p>
        {!active && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {['🏠 Homepage feature', '🔍 Priority in search', '✅ Verified badge', '📊 Analytics boost', '🎯 Targeted buyers', '💬 Priority support'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-[13px] text-white/90 bg-white/10 px-3 py-2 rounded-[8px]">{f}</div>
            ))}
          </div>
        )}
        {!active ? (
          <button onClick={() => { setActive(true); toast.success('🌟 Spotlight activated!') }}
            className="px-6 py-3 bg-[#FFC200] text-black font-[800] rounded-[10px] hover:bg-[#e6af00] transition-colors">
            Get Spotlight — ₦5,000/month
          </button>
        ) : (
          <button className="px-6 py-3 bg-white/20 text-white font-[700] text-[13px] rounded-[10px] hover:bg-white/30 transition-colors">
            Manage Subscription
          </button>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-6">
        <h3 className="font-[700] text-[15px] mb-4">Frequently Asked Questions</h3>
        {[
          ['How does Spotlight work?', 'Your store appears in the featured vendor carousel on the homepage and gets priority placement in search and category pages.'],
          ['Can I cancel anytime?', 'Yes, you can cancel your Spotlight subscription at any time from this page with no extra charges.'],
          ['When does billing happen?', 'Billing is monthly from the date you activate. Payments are processed via Paystack.'],
        ].map(([q, a]) => (
          <div key={q} className="mb-4 last:mb-0">
            <p className="font-[700] text-[14px] mb-1">{q}</p>
            <p className="text-[13px] text-gray-500 leading-[1.6]">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsTab() {
  const { user, setAuth, token, tokenExpiry, refreshToken } = useAuthStore()
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' })
  const [store, setStore] = useState({ store_name: '', store_description: '', business_hours: '' })
  const [verif, setVerif] = useState({ business_name: '', business_category: '', document_url: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingStore, setSavingStore] = useState(false)
  const [savingVerif, setSavingVerif] = useState(false)
  const [tab, setTab] = useState<'profile' | 'store' | 'verify'>('profile')

  const inp = 'w-full px-4 py-[11px] border-[1.5px] border-gray-200 rounded-[10px] text-[14px] outline-none focus:border-[#00853D] transition-colors'

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      await profileApi.update(profile)
      if (user && token && tokenExpiry) {
        setAuth({ status: true, message: '', data: { ...user, ...profile }, jwt_token: token, jwt_expiry: tokenExpiry, jwt_refresh: refreshToken ?? '', jwt_refresh_exp: 0 })
      }
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') } finally { setSavingProfile(false) }
  }

  const handleStoreSave = async () => {
    setSavingStore(true)
    try { await vendorApi.updateStore(store); toast.success('Store info updated!') }
    catch { toast.error('Update failed') } finally { setSavingStore(false) }
  }

  const handleVerifSave = async () => {
    if (!verif.business_name || !verif.business_category) { toast.error('Fill required fields'); return }
    setSavingVerif(true)
    try { await vendorApi.submitVerification(verif); toast.success('Verification submitted! We\'ll review within 24 hours.') }
    catch { toast.error('Submission failed') } finally { setSavingVerif(false) }
  }

  return (
    <div className="max-w-[580px]">
      <div className="mb-5">
        <h2 className="text-[20px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>Settings</h2>
        <p className="text-[13px] text-gray-500">Manage your account, store details, and verification</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex bg-gray-100 rounded-[10px] p-[3px] mb-5">
        {([['profile', 'Account'], ['store', 'Store Info'], ['verify', 'Verification']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('flex-1 py-[8px] rounded-[8px] text-[13px] font-[700] transition-all', tab === id ? 'bg-white shadow-sm text-[#1A1A1A]' : 'text-gray-500')}>
            {label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-6">
          <h3 className="font-[700] text-[16px] mb-4">Account Profile</h3>
          <div className="space-y-4">
            {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Phone Number', 'phone', 'tel']].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">{label}</label>
                <input type={type} value={(profile as Record<string, string>)[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} className={inp} />
              </div>
            ))}
          </div>
          <button onClick={handleProfileSave} disabled={savingProfile}
            className="w-full mt-5 py-[13px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors disabled:opacity-60">
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Store info */}
      {tab === 'store' && (
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-6">
          <h3 className="font-[700] text-[16px] mb-4">Store Information</h3>
          <div className="space-y-4">
            <div><label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Store Name</label><input value={store.store_name} onChange={(e) => setStore((s) => ({ ...s, store_name: e.target.value }))} placeholder="e.g. Mama Kitchen" className={inp} /></div>
            <div><label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Description</label><textarea value={store.store_description} onChange={(e) => setStore((s) => ({ ...s, store_description: e.target.value }))} rows={3} placeholder="Tell buyers about your store…" className={inp + ' resize-none'} /></div>
            <div><label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Business Hours</label><input value={store.business_hours} onChange={(e) => setStore((s) => ({ ...s, business_hours: e.target.value }))} placeholder="8am – 10pm daily" className={inp} /></div>
          </div>
          <button onClick={handleStoreSave} disabled={savingStore}
            className="w-full mt-5 py-[13px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors disabled:opacity-60">
            {savingStore ? 'Saving…' : 'Save Store Info'}
          </button>
        </div>
      )}

      {/* Verification */}
      {tab === 'verify' && (
        <div className="bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,.07)] border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-5 p-3 bg-amber-50 rounded-[10px] border border-amber-200">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-[1px]" />
            <p className="text-[13px] text-amber-700 leading-[1.6]">Submit your business documents to get the <strong>Verified Vendor</strong> badge and build trust with buyers.</p>
          </div>
          <h3 className="font-[700] text-[16px] mb-4">Business Verification</h3>
          <div className="space-y-4">
            <div><label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Business Name *</label><input value={verif.business_name} onChange={(e) => setVerif((v) => ({ ...v, business_name: e.target.value }))} placeholder="Your registered business name" className={inp} /></div>
            <div>
              <label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Business Category *</label>
              <select value={verif.business_category} onChange={(e) => setVerif((v) => ({ ...v, business_category: e.target.value }))} className={inp + ' cursor-pointer'}>
                <option value="">Select category</option>
                {['Restaurant/Food', 'Fashion/Clothing', 'Electronics', 'Beauty/Cosmetics', 'Groceries', 'Home & Decor', 'Sports & Fitness', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-[11px] font-[800] text-gray-500 uppercase tracking-[.07em] mb-[5px]">Document URL (CAC, NIN, etc.)</label><input value={verif.document_url} onChange={(e) => setVerif((v) => ({ ...v, document_url: e.target.value }))} placeholder="https://drive.google.com/your-document" className={inp} /></div>
          </div>
          <button onClick={handleVerifSave} disabled={savingVerif}
            className="w-full mt-5 py-[13px] bg-[#00853D] text-white font-[800] rounded-[10px] hover:bg-[#006b31] transition-colors disabled:opacity-60">
            {savingVerif ? 'Submitting…' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isVendor, clearAuth } = useAuthStore()
  const [tab, setTab] = useState('overview')
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth'); return }
    if (!isVendor()) { router.replace('/buyer') }
  }, []) // eslint-disable-line

  const handleLogout = () => { clearAuth(); router.push('/auth') }
  const changeTab = (t: string) => { setTab(t); setMobile(false) }

  const renderTab = () => {
    switch (tab) {
      case 'overview': return <OverviewTab />
      case 'products': return <ProductsTab />
      case 'orders': return <OrdersTab />
      case 'analytics': return <AnalyticsTab />
      case 'messages': return <MessagesTab />
      case 'spotlight': return <SpotlightTab />
      case 'settings': return <SettingsTab />
      default: return <OverviewTab />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-gray-100">
        <Sidebar active={tab} onChange={changeTab} onLogout={handleLogout} user={user} />
      </div>

      {/* Mobile sidebar */}
      {mobile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[200]" onClick={() => setMobile(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-[240px] z-[201] shadow-2xl">
            <Sidebar active={tab} onChange={changeTab} onLogout={handleLogout} user={user} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobile(true)} className="md:hidden p-1 rounded-[6px] hover:bg-gray-100"><Menu size={20} /></button>
            <h1 className="text-[17px] font-[800]" style={{ fontFamily: 'var(--font-syne, system-ui)' }}>
              {NAV.find((n) => n.id === tab)?.label ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-gray-500 hidden sm:block">{user?.name}</span>
            <button onClick={() => changeTab('spotlight')}
              className="hidden sm:block bg-[#FFC200] text-black text-[12px] font-[800] px-3 py-[6px] rounded-[6px] hover:bg-[#e6af00] transition-colors">
              ⭐ Spotlight
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <div className="page-enter max-w-[1200px]">{renderTab()}</div>
        </div>
      </div>
    </div>
  )
}
