import { FaAward } from 'react-icons/fa6';
import { FiX } from 'react-icons/fi';

interface AwardTagProps {
  awardName: string;
  awardColor: string;
  onClick?: () => void;
  onRemove?: () => void;
}

const AwardTag = ({ awardName, awardColor, onClick, onRemove }: AwardTagProps) => {
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
