import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { FILE_FORMAT_GROUPS } from '@constants/submission';
import type { SubmissionFileFormat } from '@dto/submissionDto';

interface FileFormatSelectProps {
  value: SubmissionFileFormat | null;
  onChange: (value: SubmissionFileFormat) => void;
}

export const FileFormatSelect = ({ value, onChange }: FileFormatSelectProps) => {
  return (
    <Select value={value ?? undefined} onValueChange={(v) => onChange(v as SubmissionFileFormat)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="파일 형식 선택" />
      </SelectTrigger>
      <SelectContent>
        {FILE_FORMAT_GROUPS.map((group) => (
          <SelectItem key={group.key} value={group.key}>
            <span className="font-medium">{group.label}</span>
            <span className="text-midGray ml-2 text-xs">{group.extensions.join(', ')}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
