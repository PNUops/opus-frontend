import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

import AwardTag from '@components/AwardTag';
import { AwardDto } from 'types/DTO/awardsDto';
import { AWRD_PALETTE } from 'constants/palette';
import useDebounce from 'hooks/useDebounce';

interface AwardSelectorProps {
  awards: AwardDto[];
  options?: string[];
  onSelect?: (selected: string[]) => void;
}

const AwardSelector = ({ awards, options, onSelect }: AwardSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newAwardName, setNewAwardName] = useState('');
  const debouncedAwardName = useDebounce(newAwardName, 300);

  return (
    <div className="flex w-full items-center gap-4">
      <label className="w-30 flex-shrink-0 text-sm leading-none">상훈 명칭</label>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          setNewAwardName('');
        }}
      >
        <PopoverTrigger asChild>
          <div className="hover:bg-whiteGray flex min-h-[44px] flex-1 cursor-pointer items-center justify-between rounded-md p-2">
            {awards && awards.length > 0 ? (
              <div className="flex gap-3">
                {awards.map((award, index) => (
                  <AwardTag key={index} awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
                ))}
              </div>
            ) : (
              <p className="text-midGray">해당 팀에 등록된 상이 없습니다.</p>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex min-h-[var(--radix-popover-trigger-height)] w-fit flex-col overflow-hidden p-0 text-sm shadow-xl"
          sideOffset={-44}
        >
          <div className="bg-whiteGray flex items-center gap-4 p-4">
            {awards.filter((award) => award.awardName && award.awardColor).length > 0 && (
              <div className="flex items-center gap-3">
                {awards.map((award, index) => (
                  <AwardTag
                    key={index}
                    awardName={award.awardName ?? ''}
                    awardColor={award.awardColor ?? ''}
                    removable={true}
                  />
                ))}
              </div>
            )}
            <div className="inline-grid min-w-[50px] items-center">
              <span className="invisible col-start-1 row-start-1 px-1 whitespace-pre">
                {newAwardName || '상훈 명칭 입력...'}
              </span>
              <input
                className="col-start-1 row-start-1 w-full bg-transparent outline-none"
                value={newAwardName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAwardName(e.target.value)}
                placeholder={newAwardName ? '' : '상훈 명칭 입력...'}
                autoFocus
              />
            </div>
          </div>
          {debouncedAwardName && (
            <div className="flex flex-col items-start gap-3 p-4">
              <p className="text-midGray text-base font-medium">옵션을 선택하여 상훈을 추가하세요.</p>
              {AWRD_PALETTE.map((color) => (
                <button key={color} type="button" onClick={() => alert(`${color}`)}>
                  <AwardTag awardName={debouncedAwardName} awardColor={color} />
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AwardSelector;
