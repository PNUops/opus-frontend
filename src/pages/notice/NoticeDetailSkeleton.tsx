const NoticeDetailSkeleton = () => {
  return (
    <div className="max-w mx-auto">
      <h1 className="mb-6 text-2xl font-bold">공지사항</h1>
      <div className="bg-whiteGray mb-2 flex animate-pulse items-center rounded px-4 py-5">
        <div className="flex-1">
          <div className="bg-lightGray mb-2 h-5 w-3/4 rounded"></div>
        </div>
      </div>

      <div className="mb-6 animate-pulse text-right">
        <div className="bg-lightGray inline-block h-4 w-40 rounded"></div>
      </div>

      <div className="bg-subGreen rounded p-6">
        <div className="space-y-3">
          <div className="bg-lightGray h-4 w-1/2 rounded"></div>
          <div className="bg-lightGray h-4 w-2/3 rounded"></div>
          <div className="bg-lightGray h-4 w-4/5 rounded"></div>
          <div className="bg-lightGray h-4 w-1/2 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailSkeleton;
