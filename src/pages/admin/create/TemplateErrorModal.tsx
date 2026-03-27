import { AdminActionButton } from '@components/admin';
import { DialogContent, DialogTitle, DialogClose } from '@components/ui/dialog';

interface TemplateErrorModalProps {
  errors: string[];
}

export const TemplateErrorModal = ({ errors }: TemplateErrorModalProps) => {
  return (
    <DialogContent className="w-[450px] gap-6">
      <DialogTitle className="text-mainRed text-xl">{'템플릿 형식 오류'}</DialogTitle>
      <p className="whitespace-pre-wrap">{`등록하신 파일에서 아래의 오류들이 발견되었습니다.\n수정 후 파일을 다시 업로드 해주세요.`}</p>
      <ul className="flex flex-col gap-2">
        {errors.map((error) => (
          <li key={error} className="text-sm">
            {error}
          </li>
        ))}
      </ul>
      <DialogClose asChild>
        <AdminActionButton variant={'outline'} size={'lg'} className="mx-auto rounded-full">
          닫기
        </AdminActionButton>
      </DialogClose>
    </DialogContent>
  );
};
