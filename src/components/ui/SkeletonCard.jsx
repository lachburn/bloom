export default function SkeletonCard() {
  return (
    <div className="bg-gradient-to-br from-white to-bloom-50 rounded-3xl p-4 shadow-card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-2xl bg-bloom-100" />
        <div className="w-16 h-4 rounded-full bg-bloom-100" />
      </div>
      <div className="w-24 h-4 rounded-full bg-bloom-100 mb-2" />
      <div className="w-16 h-3 rounded-full bg-bloom-50 mb-4" />
      <div className="w-full h-10 rounded-2xl bg-bloom-100" />
    </div>
  )
}
