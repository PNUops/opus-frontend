const Divider = () => {
  return (
    <div className="flex w-full items-center gap-4 text-xs" aria-hidden="true">
      <span className="bg-lightGray h-px flex-1" />
      <span className="whitespace-nowrap text-neutral-500">또는</span>
      <span className="bg-lightGray h-px flex-1" />
    </div>
  );
};

export default Divider;
