import { Construction } from 'lucide-react';

const TeamPagePlaceholder = ({ title }: { title: string }) => {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-8 md:p-12">
      <div className="border-lightGray flex min-h-60 flex-col items-center justify-center gap-3 rounded-lg border bg-white text-center">
        <span className="bg-whiteGray text-midGray flex size-10 items-center justify-center rounded-full">
          <Construction size={20} />
        </span>
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
        <p className="text-midGray text-sm">준비 중입니다.</p>
      </div>
    </section>
  );
};

export default TeamPagePlaceholder;
