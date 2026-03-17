'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MdCheckCircle, MdLocalShipping, MdStorefront, MdInventory2 } from 'react-icons/md'
import { FaPartyPopper } from 'react-icons/fa6'
import { BsFillBoxSeamFill } from 'react-icons/bs'

const STEPS = [
  { label: 'Order Confirmed', icon: MdCheckCircle, color: '#00853D' },
  { label: 'Vendor Preparing', icon: MdStorefront, color: '#F85606' },
  { label: 'Out for Delivery', icon: MdLocalShipping, color: '#0066CC' },
  { label: 'Delivered', icon: BsFillBoxSeamFill, color: '#7C3AED' },
]

export default function SuccessPage() {
  const params = useSearchParams()
  const router = useRouter()
  const ref = params.get('ref') ?? 'VND-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const [step, setStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    let cur = 1
    const t = setInterval(() => { cur++; if (cur >= STEPS.length) { clearInterval(t); return } setStep(cur + 1) }, 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 4000); return () => clearTimeout(t) }, [])

  const colors = ['#F85606', '#FFC200', '#00853D', '#0066CC', '#7C3AED', '#E01D1D']

  return (
    <div className="max-w-[500px] mx-auto px-[18px] py-10 text-center relative page-enter">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${Math.random() * 100}%`, top: '-10px',
              width: Math.random() * 9 + 4, height: Math.random() * 9 + 4,
              background: colors[i % colors.length],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `confettiFall ${1.6 + Math.random() * 2}s ${Math.random() * 0.8}s linear forwards`,
            }} />
          ))}
        </div>
      )}

      <div className="relative z-10">
        <div className="w-24 h-24 rounded-full bg-[#E8F7EF] flex items-center justify-center mx-auto mb-5">
          <MdCheckCircle size={56} className="text-[#00853D]" />
        </div>

        <h1 className="text-[26px] font-[800] mb-2">Payment Confirmed!</h1>
        <p className="text-[14px] text-[#757575] mb-5 leading-[1.6]">Your vendor is getting your order ready. You'll get updates via email/SMS.</p>

        <div className="bg-[#E8F7EF] border-[1.5px] border-[#A3D9B5] rounded-[10px] px-5 py-3 font-mono text-[14px] font-[800] mb-6 text-[#00853D] flex items-center justify-center gap-2">
          <MdInventory2 size={16} />
          {ref}
        </div>

        {/* Tracker */}
        <div className="bg-white border-[1.5px] border-[#E8E8E8] rounded-[12px] p-[18px] mb-6 text-left shadow-[var(--sh)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-[800]">Delivery Tracker</h2>
            <span className="bg-[#E8F7EF] text-[#00853D] text-[12px] font-[800] px-3 py-1 rounded-full">~35 mins</span>
          </div>
          {STEPS.map((s, i) => {
            const isDone = i < step - 1
            const isActive = i === step - 1
            const Icon = s.icon
            return (
              <div key={i} className={`flex gap-[14px] relative ${i < STEPS.length - 1 ? 'pb-[18px]' : ''}`}>
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[14px] top-[30px] bottom-[-4px] w-[2px] transition-colors duration-500 ${isDone ? 'bg-[#00853D]' : 'bg-[#E8E8E8]'}`} />
                )}
                <div className={`w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-500 ${
                  isDone ? 'border-[#00853D] bg-[#00853D]' : isActive ? 'border-[#F85606] bg-white shadow-[0_0_0_4px_rgba(248,86,6,.12)]' : 'border-[#E8E8E8] bg-white'
                }`}>
                  {isDone && <Icon size={15} className="text-white" />}
                  {isActive && <Icon size={15} style={{ color: s.color }} />}
                </div>
                <div className="pt-[3px]">
                  <p className={`text-[13px] font-[700] ${isDone || isActive ? 'text-[#1A1A1A]' : 'text-[#757575]'}`}>{s.label}</p>
                  <p className={`text-[11px] mt-[2px] ${isActive ? 'text-[#F85606] font-[700]' : 'text-[#ABABAB]'}`}>
                    {isDone ? 'Done ✓' : isActive ? 'In progress…' : 'Upcoming'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => router.push('/buyer')}
          className="w-full py-[14px] bg-[#F85606] text-white text-[15px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">
          Continue Shopping
        </button>
      </div>
      <style>{`@keyframes confettiFall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}
