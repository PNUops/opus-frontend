import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import Checkbox from '@components/ui/Checkbox';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';
import { labelByField } from '@constants/requiredFields';
import { getRequiredFields } from '@apis/requiredFields';

interface RequiredFieldsProps {
  contestId: number;
  fields: RequiredFieldsDto;
  onToggle: (key: string, value: boolean) => void;
  setFieldsSetting: Dispatch<SetStateAction<RequiredFieldsDto>>;
}

const RequiredFields: React.FC<RequiredFieldsProps> = ({ contestId, fields, onToggle, setFieldsSetting }) => {
  const { data: requiredFields } = useSuspenseQuery({
    queryKey: ['requiredFields', contestId],
    queryFn: () => getRequiredFields(contestId),
  });

  useEffect(() => {
    setFieldsSetting(requiredFields);
  }, [requiredFields]);

  return (
    <div className={'border-lightGray rounded-lg border shadow-sm'}>
      <div className="bg-whiteGray flex justify-between rounded-lg rounded-b-none px-7 py-4.5">
        <div>필드명</div>
        <div className="w-16 text-center">필수</div>
      </div>
      <div>
        {(Object.entries(fields) as [keyof RequiredFieldsDto, boolean][]).map(([key, value]) => (
          <div key={key} className={`flex items-center justify-between border-t px-7 py-4.5 hover:bg-gray-50`}>
            <div>{labelByField[key]}</div>
            <div className="flex w-16 justify-center">
              <Checkbox
                checked={value}
                onChange={(checked) => onToggle(key, checked)}
                ariaLabel={`${labelByField[key]} 필수 여부`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequiredFields;
