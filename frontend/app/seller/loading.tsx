export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="h-20 bg-muted border-b" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
