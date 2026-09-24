export const NewsCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md">
    <div className="skeleton h-56 w-full"></div>
    <div className="p-6 space-y-3">
      <div className="skeleton h-5 w-full rounded"></div>
      <div className="skeleton h-5 w-3/4 rounded"></div>
      <div className="skeleton h-3 w-full rounded"></div>
      <div className="skeleton h-3 w-5/6 rounded"></div>
      <div className="flex justify-between pt-4 border-t">
        <div className="skeleton h-3 w-20 rounded"></div>
        <div className="skeleton h-3 w-16 rounded"></div>
      </div>
    </div>
  </div>
);

export const LargeCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden shadow-xl">
    <div className="skeleton h-[350px] w-full"></div>
  </div>
);

export const PopularSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
    <div className="skeleton h-6 w-1/2 rounded mb-4"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="skeleton w-20 h-20 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full rounded"></div>
          <div className="skeleton h-4 w-3/4 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export const NewsDetailSkeleton = () => (
  <div className="animate-pulse">
    <div className="skeleton h-[400px] md:h-[500px] w-full"></div>
    <div className="container-custom -mt-32 relative z-10">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 space-y-4">
        <div className="skeleton h-4 w-1/4 rounded"></div>
        <div className="skeleton h-10 w-full rounded"></div>
        <div className="skeleton h-10 w-3/4 rounded"></div>
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-5/6 rounded"></div>
      </div>
    </div>
  </div>
);

export default NewsCardSkeleton;