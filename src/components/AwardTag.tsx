import { FaAward } from 'react-icons/fa6';
import { FiX } from 'react-icons/fi';
import { useAdminUi } from '@components/admin/AdminUiContext';

interface AwardTagProps {
  awardName: string;
  awardColor: string;
  onClick?: () => void;
  onRemove?: () => void;
}

const AwardTag = ({ awardName, awardColor, onClick, onRemove }: AwardTagProps) => {
  const isAdminUi = useAdminUi();
  if (isAdminUi) {
    const label = (
      <>
        <FaAward className="size-3.5 shrink-0 text-neutral-500" aria-hidden />
        <span className="min-w-0 truncate">{awardName}</span>
      </>
    );
    return (
      <span
        className="border-lightGray inline-flex max-w-full min-w-0 items-center rounded-md border border-l-4 bg-white text-sm font-medium text-neutral-800"
        style={{ borderLeftColor: awardColor }}
      >
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="hover:bg-whiteGray focus-visible:outline-mainBlue inline-flex min-h-9 min-w-0 items-center gap-1.5 rounded-sm px-2 py-1 focus-visible:outline-2"
          >
            {label}
          </button>
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1.5 px-2 py-1">{label}</span>
        )}
        {onRemove && (
          <button
            type="button"
            aria-label={`${awardName} 삭제`}
            onClick={onRemove}
            className="hover:bg-whiteGray focus-visible:outline-mainBlue flex size-8 shrink-0 items-center justify-center rounded-sm text-neutral-600 focus-visible:outline-2"
          >
            <FiX size={16} aria-hidden />
          </button>
        )}
      </span>
    );
  }
  return (
    <span
      className={`award-tag relative inline-flex max-w-full min-w-0 items-center justify-center overflow-hidden rounded-full border px-4 py-0.5 text-sm font-medium text-white ${onClick ? 'hover:cursor-pointer hover:brightness-90' : ''}`}
      style={{
        backgroundColor: awardColor,
        borderColor: awardColor,
      }}
      onClick={onClick}
    >
      <span className="award-shimmer" />
      <FaAward className="relative z-10 mr-1 shrink-0" />
      <span
        className="relative z-10 max-w-full min-w-0 truncate overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ display: 'inline-block', minWidth: 0, maxWidth: '100%' }}
      >
        {awardName}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onRemove) {
              onRemove();
            }
          }}
          className="ml-2 shrink-0 rounded-full bg-white/40 p-1 text-white outline-none hover:bg-white/70"
        >
          <FiX size={15} className="hover:cursor-pointer" />
        </button>
      )}
    </span>
  );
};

export default AwardTag;
