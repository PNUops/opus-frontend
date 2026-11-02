import { cn } from '@components/lib/utils';
import { FILE_FORMAT_EXTENSION, FILE_FORMAT_OPTIONS } from '@constants/submission';
import type { SubmissionFileFormat } from '@dto/submissionDto';

interface FileFormatSelectProps {
  value: SubmissionFileFormat[];
  onChange: (value: SubmissionFileFormat[]) => void;
}

export const FileFormatSelect = ({ value, onChange }: FileFormatSelectProps) => {
  const toggle = (format: SubmissionFileFormat) => {
    if (value.includes(format)) {
      onChange(value.filter((v) => v !== format));
    } else {
      onChange([...value, format]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILE_FORMAT_OPTIONS.map((format) => {
        const active = value.includes(format);
        return (
          <button
            key={format}
            type="button"
            onClick={() => toggle(format)}
            aria-pressed={active}
            className={cn(
              'focus-visible:outline-mainBlue min-h-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2',
              active
                ? 'border-mainBlue text-mainBlue bg-blue-50'
                : 'border-input bg-white text-neutral-600 hover:bg-gray-50',
            )}
          >
            {FILE_FORMAT_EXTENSION[format]}
          </button>
        );
      })}
    </div>
  );
};
