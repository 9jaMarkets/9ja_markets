import React from "react";

const SkeletonCard = () => {
  return (
    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
      {/* Image skeleton */}
      <div className="w-full aspect-video bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-3 md:p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded-full w-3/4 animate-pulse" />
        
        {/* Address skeleton */}
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 mt-1 bg-gray-200 rounded-full flex-shrink-0 animate-pulse" />
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse" />
            <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard; 