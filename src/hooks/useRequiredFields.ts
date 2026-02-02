import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultRequiredFields } from 'constants/requiredFields';
import { RequiredFieldsDto, RequiredFieldsType } from 'types/DTO/requiredFieldsDto';
import { useToast } from './useToast';
import { getRequiredFields, putRequiredFields } from 'apis/requiredFields';

export const useRequiredFields = () => {
  const { contestId } = useParams();
  const [fieldsSetting, setFieldsSetting] = useState<RequiredFieldsDto>(defaultRequiredFields);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: requiredFields } = useQuery({
    queryKey: ['requiredFields', contestId],
    queryFn: () => getRequiredFields(Number(contestId ?? 0)),
    enabled: !!contestId,
  });
  const updateRequiredFields = useMutation({
    mutationKey: [`updateRequiredFields`],
    mutationFn: (payload: RequiredFieldsDto) => putRequiredFields(Number(contestId ?? 0), payload),
  });

  useEffect(() => {
    if (requiredFields) {
      setFieldsSetting(requiredFields);
    }
  }, [requiredFields]);

  const toggleField = (key: string, value: RequiredFieldsType) => {
    setFieldsSetting((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!fieldsSetting) return;

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

  return { fieldsSetting, isLoading: updateRequiredFields.isPending, toggleField, handleSave };
};
