export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-white rounded" />
          <div className="h-10 w-32 bg-white rounded" />
        </div>
        
        {/* Goal cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full max-w-64 overflow-hidden rounded-3xl border-2 border-gray-200 flex flex-col bg-white h-48">
              <div className="p-3 pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 w-32 mb-1 bg-white rounded" />
                    <div className="h-3 w-16 bg-white rounded" />
                  </div>
                  <div className="flex flex-col items-end ml-1">
                    <div className="h-3 w-8 bg-white rounded" />
                  </div>
                </div>
              </div>

              <div className="space-y-0.5 p-3 pt-0 flex-1">
                <div className="space-y-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-3 w-12 bg-white rounded" />
                    <div className="h-3 w-8 bg-white rounded" />
                  </div>
                  <div className="h-1 w-full bg-white rounded" />
                </div>

                <div className="h-3 w-full bg-white rounded" />
                
                <div className="flex items-center gap-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-white" />
                    ))}
                  </div>
                  <div className="h-3 w-6 ml-1 bg-white rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 p-3 pt-0 items-center mt-auto">
                <div className="h-5 w-full bg-white rounded" />
                <div className="h-5 w-full bg-white rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}