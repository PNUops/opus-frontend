import { useEffect, useId, useState, type ReactNode } from 'react';
import { useMediaQuery } from '@react-hookz/web';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

interface FilterField {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

/** 모바일의 짧은 필터 선택만 시트에 모으고, 검색어 입력과 결과는 본문에 남깁니다. */
export const AdminMobileFilters = ({
  title,
  fields,
  onReset,
  children,
}: {
  title: string;
  fields: readonly FilterField[];
  onReset: () => void;
  children: ReactNode;
}) => {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const [open, setOpen] = useState(false);
  const [openField, setOpenField] = useState<string | null>(null);
  const id = useId();
  const count = fields.filter((field) => field.value !== '').length;

  useEffect(() => {
    if (!isMobile) {
      setOpen(false);
      setOpenField(null);
    }
  }, [isMobile]);
  if (!isMobile) return children;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setOpenField(null);
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          className="border-lightGray text-mainBlue focus-visible:outline-mainBlue flex min-h-11 shrink-0 items-center gap-2 rounded-md border bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <SlidersHorizontal size={16} aria-hidden />
          필터{count > 0 && <span aria-label={`${count}개 적용`}>{count}</span>}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[calc(100dvh-16px)] gap-0 bg-white motion-reduce:animate-none"
        onEscapeKeyDown={(event) => {
          if (openField !== null) event.preventDefault();
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-3">
          <SheetTitle className="text-lg">{title}</SheetTitle>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="필터 닫기"
              className="hover:bg-whiteGray focus-visible:outline-mainBlue flex size-11 items-center justify-center rounded-md text-neutral-600 focus-visible:outline-2"
            >
              <X size={20} aria-hidden />
            </button>
          </SheetClose>
        </div>
        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto p-5">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <label htmlFor={`${id}-${field.id}`} className="text-sm font-medium text-neutral-800">
                {field.label}
              </label>
              <Select
                open={openField === field.id}
                onOpenChange={(nextOpen) => setOpenField(nextOpen ? field.id : null)}
                value={String(field.options.findIndex((option) => option.value === field.value))}
                onValueChange={(index) => {
                  const option = field.options[Number(index)];
                  if (option) field.onChange(option.value);
                }}
              >
                <SelectTrigger
                  id={`${id}-${field.id}`}
                  className="focus:ring-mainBlue min-h-11 w-full border bg-white shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  onEscapeKeyDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpenField(null);
                  }}
                  position="popper"
                  collisionPadding={16}
                  className="max-h-[min(280px,var(--radix-select-content-available-height))]"
                >
                  {field.options.map((option, index) => (
                    <SelectItem
                      key={option.value}
                      value={String(index)}
                      className="min-h-11 max-w-[calc(100vw-48px)] break-words whitespace-normal"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="flex shrink-0 gap-3 border-t px-5 pt-4 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onReset}
            className="border-lightGray focus-visible:outline-mainBlue min-h-11 rounded-md border px-5 text-sm text-neutral-700 focus-visible:outline-2"
          >
            초기화
          </button>
          <SheetClose asChild>
            <button
              type="button"
              className="bg-mainBlue focus-visible:outline-mainBlue min-h-11 flex-1 rounded-md px-5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              결과 보기
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
