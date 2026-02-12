import React from 'react';
import Checkbox from '@components/ui/Checkbox';
import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';
import { labelByField } from 'constants/requiredFields';
import { cn } from 'utils/classname';

interface RequiredFieldsProps {
  fields: RequiredFieldsDto;
  onToggle: (key: string, value: boolean) => void;
  className?: string;
}

const RequiredFields: React.FC<RequiredFieldsProps> = ({ fields, onToggle, className = '' }) => {
  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}>
      <div className="w-full text-sm">
        <div className="flex justify-between bg-gray-100 px-7 py-5 font-medium">
          <div>필드명</div>
          <div className="w-16 text-center">필수</div>
        </div>
        <div>
          {Object.entries(fields).map(([key, value]) => (
            <div key={key} className={`flex items-center justify-between border-t px-7 py-5 hover:bg-gray-50`}>
              <div>{labelByField[key]}</div>
              <div className="flex w-16 justify-center">
                <Checkbox
                  checked={value === 'REQUIRED'}
                  onChange={(checked) => onToggle(key, checked)}
                  ariaLabel={`${labelByField[key]} 필수 여부`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequiredFields;
