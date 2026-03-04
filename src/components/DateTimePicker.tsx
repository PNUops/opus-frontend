import { useState, useEffect } from 'react';
import { CiCalendar } from 'react-icons/ci';
import dayjs, { Dayjs } from 'dayjs';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@components/ui/popover';
import { Calendar } from './calendar';

interface DateTimePickerProps {
  label: string;
  prevDate: string | Dayjs;
  onChange: (date: Dayjs) => void;
}

export const DateTimePicker = ({ label, prevDate, onChange }: DateTimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [dateTime, setDateTime] = useState<Dayjs>(dayjs(prevDate));
  const [timeInputValue, setTimeInputValue] = useState<string>(dayjs(prevDate).format('HH:mm'));

  useEffect(() => {
    const newDateTime = dayjs(prevDate);
    setDateTime(newDateTime);
    setTimeInputValue(newDateTime.format('HH:mm'));
  }, [prevDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    const newDateTime = dayjs(date).hour(dateTime.hour()).minute(dateTime.minute());

    setDateTime(newDateTime);
    setOpen(false);

    onChange(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTimeInputValue(value);
  };

  const handleTimeBlur = () => {
    const timeParts = timeInputValue.split(':').map(Number);
    const [hours, minutes] = timeParts;

    if (isNaN(hours) || isNaN(minutes)) {
      setTimeInputValue(dateTime.format('HH:mm'));
      return;
    }

    const newDateTime = dateTime.hour(hours).minute(minutes);
    setDateTime(newDateTime);
    onChange(newDateTime);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Label htmlFor="time-picker" className="font-normal whitespace-nowrap">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date-picker" className="w-[150px] justify-between font-normal">
              {dateTime ? dateTime.format('YYYY-MM-DD') : '날짜 선택'}
              <CiCalendar size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTime.toDate()}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          id="time-picker"
          value={timeInputValue}
          onChange={handleTimeChange}
          onBlur={handleTimeBlur}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
};

export default DateTimePicker;
