'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MdShoppingBag, MdLocalShipping, MdCheckCircle,
  MdCancel, MdPending, MdStorefront, MdArrowBack,
} from 'react-icons/md'
import { orderApi } from '@/lib/api'
import { ngn, dedupe } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import type { Order } from '@/types'

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: MdPending },
  accepted:  { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: MdStorefront },
  paid:      { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: MdStorefront },
  shipped:   { bg: 'bg-indigo-50',  text: 'text-indigo-700',  icon: MdLocalShipping },
  delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: MdCheckCircle },
  cancelled: { bg: 'bg-red-50',     text: 'text-red-600',     icon: MdCancel },
  rejected:  { bg: 'bg-red-50',     text: 'text-red-600',     icon: MdCancel },
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/auth'); return }
    orderApi.history()
      .then((r) => {
        const raw = (r.data as { orders?: Order[] }).orders ?? []
        setOrders(dedupe(raw, 'order_uuid'))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  const FILTERS = ['all', 'pending', 'shipped', 'delivered', 'cancelled']
  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="bg-white py-[9px] border-b border-[#E8E8E8] mb-[10px]">
        <div className="max-w-[860px] mx-auto px-[14px] flex items-center gap-2 text-xs text-[#757575]">
          <button onClick={() => router.push('/buyer')} className="hover:text-[#F85606] flex items-center gap-1">
            <MdArrowBack size={14} /> Home
          </button>
          <span>›</span>
          <span className="text-[#1A1A1A]">My Orders</span>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-[14px] pb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-[20px] font-[800] flex items-center gap-2">
              <MdShoppingBag size={22} className="text-[#F85606]" /> My Orders
            </h1>
            <p className="text-[13px] text-[#757575] mt-[2px]">{orders.length} total orders</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-[6px] rounded-full text-[12px] font-[700] whitespace-nowrap flex-shrink-0 transition-all capitalize ${
                filter === f
                  ? 'bg-[#F85606] text-white'
                  : 'bg-white text-[#757575] border border-[#E8E8E8] hover:border-[#F85606]'
              }`}>
              {f === 'all' ? `All (${orders.length})` : `${f} (${orders.filter((o) => o.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-[100px] rounded-[12px]" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div className="bg-white rounded-[14px] p-12 text-center shadow-[var(--sh)] border border-[#E8E8E8]">
            <MdShoppingBag size={56} className="mx-auto mb-4 text-[#D0D0D0]" />
            <p className="font-[800] text-[16px] mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
            <p className="text-[13px] text-[#757575] mb-5">
              {filter === 'all' ? 'Start shopping and your orders will appear here' : 'Try a different filter'}
            </p>
            {filter === 'all' && (
              <button onClick={() => router.push('/buyer')}
                className="px-6 py-[11px] bg-[#F85606] text-white font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">
                Browse Products
              </button>
            )}
          </div>
        )}

        {/* Orders list */}
        {!loading && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((order) => {
              const status = order.status ?? 'pending'
              const style = STATUS_STYLE[status] ?? STATUS_STYLE['pending']
              const StatusIcon = style.icon
              return (
                <div key={order.order_uuid}
                  className="bg-white rounded-[12px] shadow-[var(--sh)] border border-[#E8E8E8] overflow-hidden hover:border-[#F85606] transition-colors">
                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#F5F5F5] bg-[#FAFAFA]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#FFF3EE] flex items-center justify-center flex-shrink-0">
                        <MdShoppingBag size={18} className="text-[#F85606]" />
                      </div>
                      <div>
                        <p className="text-[12px] font-[700] text-[#0066CC]">
                          {order.order_uuid.slice(0, 20)}…
                        </p>
                        <p className="text-[11px] text-[#ABABAB] mt-[1px]">{order.created_at ?? 'Recently'}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-[5px] text-[11px] font-[800] px-[10px] py-[4px] rounded-full capitalize ${style.bg} ${style.text}`}>
                      <StatusIcon size={13} />
                      {status}
                    </span>
                  </div>

                  {/* Order body */}
                  <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Delivery progress bar */}
                      <div className="flex items-center gap-1">
                        {['pending', 'accepted', 'shipped', 'delivered'].map((step, i) => {
                          const steps = ['pending', 'accepted', 'shipped', 'delivered']
                          const cur = steps.indexOf(status)
                          const isDone = i <= cur
                          return (
                            <div key={step} className="flex items-center">
                              <div className={`w-[7px] h-[7px] rounded-full transition-colors ${isDone ? 'bg-[#00853D]' : 'bg-[#E8E8E8]'}`} />
                              {i < 3 && <div className={`w-[22px] h-[2px] transition-colors ${i < cur ? 'bg-[#00853D]' : 'bg-[#E8E8E8]'}`} />}
                            </div>
                          )
                        })}
                      </div>
                      <span className="text-[12px] text-[#757575] font-[600] capitalize">{status}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {order.total != null && (
                        <span className="text-[16px] font-[900] text-[#F85606]">{ngn(order.total)}</span>
                      )}
                      <button
                        onClick={() => router.push(`/buyer/order/${order.order_uuid}`)}
                        className="text-[12px] font-[800] text-[#0066CC] hover:underline flex items-center gap-1">
                        View details →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
