import { cn } from '@/lib/utils'
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[10px] overflow-hidden border border-[#E8E8E8]">
      <Skeleton className="h-[160px] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/5 mt-1" /><Skeleton className="h-9 w-full mt-1" />
      </div>
    </div>
  )
}
