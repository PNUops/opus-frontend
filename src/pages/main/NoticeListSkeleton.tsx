const NoticeListSkeleton = () => {
  return (
    <div className="animate-pulse rounded-xl bg-white px-5 py-2.5 shadow-md">
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
            </div>
            <div className="ml-4 h-3 w-20 rounded bg-gray-200"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoticeListSkeleton;
