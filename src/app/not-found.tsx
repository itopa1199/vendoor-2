import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="text-center max-w-[400px]">
        <div className="text-[80px] mb-4">🔍</div>
        <h1 className="text-[32px] font-[800] text-[#1A1A1A] mb-2">Page Not Found</h1>
        <p className="text-[14px] text-[#757575] mb-6 leading-[1.7]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/buyer"
            className="px-6 py-[12px] bg-[#F85606] text-white text-[14px] font-[800] rounded-[10px] hover:bg-[#e84e05] transition-colors">
            Go to Homepage
          </Link>
          <Link href="/auth"
            className="px-6 py-[12px] bg-white text-[#1A1A1A] text-[14px] font-[700] rounded-[10px] border border-[#E8E8E8] hover:bg-[#F5F5F5] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
