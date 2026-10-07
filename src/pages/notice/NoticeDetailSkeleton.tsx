const NoticeDetailSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse" aria-hidden="true">
      <div className="bg-lightGray h-8 w-48 rounded-sm" />

      <div className="border-lightGray mt-7 border-b pb-7 sm:mt-10 sm:pb-9">
        <div className="space-y-3">
          <div className="bg-lightGray h-8 w-full max-w-3xl rounded-sm" />
          <div className="bg-lightGray h-8 w-3/5 rounded-sm" />
        </div>

        <div className="mt-5 flex gap-5">
          <div className="bg-lightGray h-4 w-28 rounded-sm" />
          <div className="bg-lightGray h-4 w-28 rounded-sm" />
        </div>
      </div>

      <div className="max-w-3xl pt-8 sm:pt-10">
        <div className="space-y-4">
          <div className="bg-lightGray h-4 w-full rounded-sm" />
          <div className="bg-lightGray h-4 w-11/12 rounded-sm" />
          <div className="bg-lightGray h-4 w-4/5 rounded-sm" />
          <div className="bg-lightGray h-4 w-2/3 rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailSkeleton;
