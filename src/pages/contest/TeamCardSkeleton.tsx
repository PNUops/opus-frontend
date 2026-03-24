const TeamCardSkeleton = () => {
    return (
      <section className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-8">
        <div
          className="border-none flex aspect-[7/8] rounded-sm w-full animate-pulse flex-col overflow-hidden border"
        >
          <div className="bg-lightGray relative aspect-[3/2] w-full">
            <div className="absolute top-2 right-2 z-10">
              <div className="h-[clamp(1.5rem,2vw,1.8rem)] w-[clamp(1.5rem,2vw,1.8rem)] rounded-full bg-midGray" />
            </div>
          </div>

          <div className="relative flex flex-1 flex-col justify-between p-3">
            <div className="flex flex-col gap-2">
              <div className="bg-lightGray h-[clamp(0.85rem,2vw,1.3rem)] w-[clamp(40%,60%,90%)] rounded" />
              <div className="bg-lightGray h-[clamp(0.8rem,1.8vw,1rem)] w-[clamp(30%,40%,70%)] rounded" />
            </div>
          </div>
        </div>
      </section>
    );
};

export default TeamCardSkeleton;
