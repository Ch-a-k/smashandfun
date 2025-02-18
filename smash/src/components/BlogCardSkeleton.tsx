"use client";

export default function BlogCardSkeleton() {
  return (
    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden animate-pulse">
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-10 pointer-events-none" />
      
      <div>
        {/* Image placeholder */}
        <div className="relative h-64 bg-white/10" />
        
        <div className="p-6 relative">
          {/* Date and read time placeholder */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-4 bg-white/10 rounded-full" />
            <div className="h-4 w-24 bg-white/10 rounded" />
          </div>
          
          {/* Title placeholder */}
          <div className="h-8 w-3/4 bg-white/10 rounded mb-3" />
          
          {/* Excerpt placeholder */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-5/6 bg-white/10 rounded" />
            <div className="h-4 w-4/6 bg-white/10 rounded" />
          </div>
          
          {/* Read more placeholder */}
          <div className="mt-4">
            <div className="h-4 w-28 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
