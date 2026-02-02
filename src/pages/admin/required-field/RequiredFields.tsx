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
      <table className="w-full table-fixed border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left font-medium text-gray-600">필드명</th>
            <th className="w-36 px-6 py-4 text-right font-medium text-gray-600">필수</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, idx) => (
            <tr key={f.label} className={`border-t hover:bg-gray-50 ${f.required ? 'bg-white' : 'bg-white'}`}>
              <td className="px-6 py-4 align-middle">{f.label}</td>
              <td className="px-6 py-4 text-right align-middle">
                <Checkbox checked={f.required} onChange={() => onToggle(idx)} ariaLabel={`${f.label} 필수 여부`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequiredFields;
