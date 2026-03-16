import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultRequiredFields } from 'constants/requiredFields';
import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';
import { putRequiredFields } from 'apis/requiredFields';
import { useToast } from './useToast';

export const useRequiredFields = (contestId: number) => {
  const [fieldsSetting, setFieldsSetting] = useState<RequiredFieldsDto>(defaultRequiredFields);
  const toast = useToast();
  const queryClient = useQueryClient();

  const updateRequiredFields = useMutation({
    mutationKey: [`updateRequiredFields`],
    mutationFn: (payload: RequiredFieldsDto) => putRequiredFields(contestId, payload),
  });

  const handleToggleField = (key: string, value: boolean) => {
    setFieldsSetting((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    updateRequiredFields.mutate(fieldsSetting, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requiredFields', contestId] });
        toast('필수 항목 설정이 저장되었습니다.', 'success');
      },
      onError: () => {
        toast('필수 항목 설정 저장에 실패했습니다.', 'error');
      },
    });
  };

  return { fieldsSetting, isPending: updateRequiredFields.isPending, setFieldsSetting, handleToggleField, handleSave };
};
