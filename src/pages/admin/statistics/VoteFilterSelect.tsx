import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import type { VoteReportRankingDto } from '@dto/voteReportDto';

interface VoteFilterSelectProps {
  selectedFilter: string;
  onChange: (value: string) => void;
  rankings: VoteReportRankingDto[];
}

const VoteFilterSelect = ({ selectedFilter, onChange, rankings }: VoteFilterSelectProps) => {
  const tracks = Array.from(new Set(rankings.map((r) => r.trackName)));
  return (
    <Select value={selectedFilter} onValueChange={onChange}>
      <SelectTrigger
        aria-label="순위 보기"
        className="border-lightGray focus-visible:ring-mainBlue h-11 w-full max-w-64 text-neutral-700 shadow-none"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[min(20rem,var(--radix-select-content-available-height))] max-w-[calc(100vw-32px)]">
        <SelectItem value="all" className="min-h-11">
          전체
        </SelectItem>
        <SelectItem value="grouped" className="min-h-11">
          분과별 묶어보기
        </SelectItem>
        {tracks.map((track) => (
          <SelectItem
            key={JSON.stringify(track)}
            value={`track:${JSON.stringify(track)}`}
            className="min-h-11 break-words"
          >
            {track ?? '분과 미지정'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default VoteFilterSelect;
