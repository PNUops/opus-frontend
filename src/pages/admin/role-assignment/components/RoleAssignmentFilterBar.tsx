import { Search } from 'lucide-react';

import { AdminActionButton } from '@components/admin';
import { ROLE_LABEL } from '@constants/roleAssignment';

import type { RoleType } from '../types/roleAssignment';

interface RoleAssignmentFilterBarProps {
  activeRole: RoleType;
  search: string;
  onSearchChange: (search: string) => void;
  onAssignClick: () => void;
}

export const RoleAssignmentFilterBar = ({
  activeRole,
  search,
  onSearchChange,
  onAssignClick,
}: RoleAssignmentFilterBarProps) => {
  const activeLabel = ROLE_LABEL[activeRole];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 basis-full flex-wrap items-center gap-3 sm:flex-1 sm:basis-auto">
        <div className="relative min-w-0 flex-1 md:max-w-[390px]">
          <Search size={18} className="text-midGray absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="search"
            aria-label={`${activeLabel} 이름 또는 담당 팀으로 검색`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${activeLabel} 이름 또는 담당 팀으로 검색`}
            className="border-lightGray placeholder:text-midGray focus:border-mainBlue h-11 w-full rounded-md border bg-white pr-3 pl-10 text-sm focus:outline-none lg:h-9"
          />
        </div>
      </div>

      <AdminActionButton
        type="button"
        variant="outline"
        size="sm"
        className="border-mainBlue text-mainBlue hover:bg-blue-50 max-lg:min-h-11"
        onClick={onAssignClick}
      >
        + {activeLabel} 배정
      </AdminActionButton>
    </div>
  );
};
