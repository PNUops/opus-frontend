import { useQuery } from '@tanstack/react-query';
import { getFindEmail } from '@apis/signIn';
import { useEffect, useState } from 'react';
import FindEmailForm from './FindEmailForm';
import FindEmailResult from './FindEmailResult';
import { FindEmailResponsetDto } from '@dto/signInDto';
import { useToast } from '@hooks/useToast';

const IdTab = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const toast = useToast();

  const { data, refetch, isLoading, isError } = useQuery<FindEmailResponsetDto>({
    queryKey: ['findEmail', studentNumber],
    queryFn: () => getFindEmail({ studentId: studentNumber }),
    enabled: false,
  });

  const handleSubmit = () => {
    if (!studentNumber.trim()) return;
    refetch();
  };

  useEffect(() => {
    if (isError) toast('회원을 찾을 수 없습니다.', 'error');
  }, [isError]);

  if (data) return <FindEmailResult email={data.email} />;
  return (
    <FindEmailForm
      studentNumber={studentNumber}
      setStudentNumber={setStudentNumber}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};
export default IdTab;
