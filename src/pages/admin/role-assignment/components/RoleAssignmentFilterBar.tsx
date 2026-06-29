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
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <div className="relative min-w-[280px] flex-1 md:max-w-[390px]">
          <Search size={18} className="text-midGray absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`${activeLabel} 이름 또는 담당 팀으로 검색`}
            className="border-lightGray placeholder:text-midGray focus:border-mainBlue h-9 w-full rounded-md border bg-white pr-3 pl-10 text-sm focus:outline-none"
          />
        </div>
      </div>

      <AdminActionButton
        type="button"
        variant="outline"
        size="sm"
        className="border-mainBlue text-mainBlue hover:bg-blue-50"
        onClick={onAssignClick}
      >
        + {activeLabel} 배정
      </AdminActionButton>
    </div>
  );
};
