const RecipeSkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
          {/* Image skeleton */}
          <div className="h-48 bg-gray-300"></div>
          
          {/* Content skeleton */}
          <div className="p-4">
            {/* Title */}
            <div className="h-5 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            
            {/* Description */}
            <div className="h-3 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
            
            {/* Meta info */}
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            
            {/* Button */}
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </>
  )
}

export default RecipeSkeletonCard