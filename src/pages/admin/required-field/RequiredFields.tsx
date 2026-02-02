import React from 'react';
import Checkbox from '@components/ui/Checkbox';

export interface RequiredFieldItem {
  label: string;
  required: boolean;
}

interface RequiredFieldsProps {
  fields: RequiredFieldItem[];
  onToggle: (index: number) => void;
  className?: string;
}

const RequiredFields: React.FC<RequiredFieldsProps> = ({ fields, onToggle, className = '' }) => {
  return (
    <div className={className}>
      <div className="w-full text-sm">
        <div className="flex justify-between bg-gray-100 px-7 py-5 font-medium">
          <div>필드명</div>
          <div className="w-16 text-center">필수</div>
        </div>
        <div>
          {fields.map((f, idx) => (
            <div key={f.label} className={`flex justify-between border-t px-7 py-5 hover:bg-gray-50`}>
              <div className="">{f.label}</div>
              <div className="flex w-16 justify-center">
                <Checkbox checked={f.required} onChange={() => onToggle(idx)} ariaLabel={`${f.label} 필수 여부`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequiredFields;
