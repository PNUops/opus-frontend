interface CampusNoticeHologramProps {
  onExploreContests: () => void;
}

const CampusNoticeHologram = ({ onExploreContests }: CampusNoticeHologramProps) => {
  return (
    <aside className="opus-campus-news" aria-label="서비스 환영">
      <header className="opus-campus-news__header">
        <div>
          <span className="opus-campus-news__signal" aria-hidden="true" />
          <strong>PNU SIGNAL</strong>
        </div>

        <span className="opus-campus-news__live">LIVE</span>
      </header>

      <div className="opus-campus-news__error">
        <div className="flex items-center gap-[9px]">
          <p className="m-0">부산대학교의 다양한 프로젝트를 함께 둘러볼까요?</p>

          <button type="button" onClick={onExploreContests} className={campusNewsClassName}>
            네
          </button>
        </div>

        <div>
          <a href="https://cse.pusan.ac.kr" target="_blank" rel="noopener noreferrer">
            CSE ↗
          </a>

          <a href="https://swedu.pusan.ac.kr" target="_blank" rel="noopener noreferrer">
            SW EDU ↗
          </a>
        </div>
      </div>
    </aside>
  );
};

export default CampusNoticeHologram;

const campusNewsClassName =
  'inline-flex h-[26px] min-w-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(69,214,236,0.72)] bg-[rgba(69,214,236,0.08)] px-[9px] text-[0.7rem] font-extrabold text-[#8aeeff] shadow-[0_0_8px_rgba(69,214,236,0.24),inset_0_0_8px_rgba(69,214,236,0.08)] transition-[background-color,color,box-shadow,transform] duration-150 hover:-translate-y-px hover:bg-[rgba(69,214,236,0.18)] hover:text-[#d6faff] hover:shadow-[0_0_8px_rgba(69,214,236,0.42),0_0_18px_rgba(69,214,236,0.22)] focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-[#45d6ec] active:scale-95';
