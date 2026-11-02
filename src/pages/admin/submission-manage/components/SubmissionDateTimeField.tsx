import Input from '@components/Input';
import { useState } from 'react';
import dayjs from 'dayjs';
import { CiCalendar } from 'react-icons/ci';

import { Calendar } from '@components/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';

interface SubmissionDateTimeFieldProps {
  /** ISO 문자열 */
  value: string;
  onChange: (value: string) => void;
}

export const SubmissionDateTimeField = ({ value, onChange }: SubmissionDateTimeFieldProps) => {
  const [open, setOpen] = useState(false);
  const current = dayjs(value);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const next = dayjs(date).hour(current.hour()).minute(current.minute());
    onChange(next.toISOString());
    setOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    onChange(current.hour(hours).minute(minutes).toISOString());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="border-lightGray focus-visible:outline-mainBlue flex h-11 w-full items-center justify-between rounded-md border bg-white px-3 text-sm focus-visible:outline-2"
        >
          {current.format('YYYY-MM-DD HH:mm')}
          <CiCalendar size={18} className="text-neutral-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="pointer-events-auto w-auto p-0">
        <Calendar
          mode="single"
          selected={current.toDate()}
          captionLayout="dropdown"
          fromYear={2020}
          toYear={2030}
          onSelect={handleDateSelect}
        />
        <div className="flex items-center gap-2 border-t p-3">
          <span className="text-sm text-neutral-600">시간</span>
          <Input
            appearance="admin"
            aria-label="시간"
            type="time"
            value={current.format('HH:mm')}
            onChange={handleTimeChange}
            className="flex-1 text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
