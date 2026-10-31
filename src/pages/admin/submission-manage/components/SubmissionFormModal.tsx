import { AdminFormError } from '@components/admin/AdminFormError';
import Input from '@components/Input';
import TextArea from '@components/TextArea';
import { ReactNode, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { LuInfo } from 'react-icons/lu';

import { AdminActionButton } from '@components/admin';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@components/ToolTip';
import { useToast } from '@hooks/useToast';
import { cn } from '@components/lib/utils';
import { FILE_SIZE_OPTIONS, VISIBILITY_DESCRIPTION, VISIBILITY_LABEL, VISIBILITY_OPTIONS } from '@constants/submission';
import type { SubmissionItemRequestDto, SubmissionVisibility } from '@dto/submissionDto';

import type { SubmissionFormValues } from '../types/submission';
import { FileFormatSelect } from './FileFormatSelect';
import { SubmissionDateTimeField } from './SubmissionDateTimeField';
import dayjs from 'dayjs';

const ALL_TRACKS = 'ALL';
const LOCAL_DATETIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

interface TrackOption {
  trackId: number;
  trackName: string;
}

interface SubmissionFormModalProps {
  mode: 'create' | 'edit';
  tracks: TrackOption[];
  initialValues?: SubmissionFormValues;
  onSubmit: (payload: SubmissionItemRequestDto) => void;
  onClose: () => void;
  isPending: boolean;
  isError: boolean;
}

const createDefaultValues = (): SubmissionFormValues => ({
  name: '',
  trackId: null,
  description: '',
  fileFormats: [],
  maxFileSizeMb: 500,
  maxFileCount: 1,
  startAt: dayjs().hour(0).minute(0).second(0).format(LOCAL_DATETIME_FORMAT),
  endAt: dayjs().hour(23).minute(59).second(0).format(LOCAL_DATETIME_FORMAT),
  allowLateSubmission: true,
  visibility: 'TEAM',
});

/** 폼 값을 요청 DTO로 변환 */
const toRequestDto = (values: SubmissionFormValues): SubmissionItemRequestDto => ({
  name: values.name.trim(),
  ...(values.trackId !== null && { contestTrackId: values.trackId }),
  ...(values.description.trim() && { description: values.description.trim() }),
  allowedFileFormats: values.fileFormats,
  maxFileSizeMb: values.maxFileSizeMb,
  maxFileCount: values.maxFileCount,
  startAt: values.startAt,
  endAt: values.endAt,
  allowLateSubmission: values.allowLateSubmission,
  visibility: values.visibility,
});

export const SubmissionFormModal = ({
  mode,
  tracks,
  initialValues,
  onSubmit,
  onClose,
  isPending,
  isError,
}: SubmissionFormModalProps) => {
  const toast = useToast();
  const [values, setValues] = useState<SubmissionFormValues>(initialValues ?? createDefaultValues());

  const update = <K extends keyof SubmissionFormValues>(key: K, value: SubmissionFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!values.name.trim()) {
      toast('제출 항목 이름을 입력해주세요.', 'error');
      return;
    }
    if (values.fileFormats.length === 0) {
      toast('파일 형식을 선택해주세요.', 'error');
      return;
    }
    if (!dayjs(values.endAt).isAfter(dayjs(values.startAt))) {
      toast('마감일시는 시작일시 이후여야 해요.', 'error');
      return;
    }
    onSubmit(toRequestDto(values));
  };

  return (
    <DialogContent appearance="admin" className="w-[600px]" closeDisabled={isPending}>
      <div className="flex flex-col gap-1">
        <DialogTitle className="text-xl font-semibold text-gray-900">
          {mode === 'create' ? '제출 항목 추가' : '제출 항목 수정'}
        </DialogTitle>
        <p className="text-sm text-neutral-600">대회에서 제출받을 자료의 종류와 제출 정책을 설정할 수 있어요.</p>
      </div>

      <fieldset disabled={isPending} className="flex min-w-0 flex-col gap-4">
        <FormRow label="제출 항목 이름">
          <Input
            appearance="admin"
            aria-label="제출 항목 이름"
            type="text"
            value={values.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="제출 항목 이름"
            className="w-full text-base sm:text-sm"
          />
        </FormRow>

        <FormRow label="대상 분과">
          <Select
            value={values.trackId === null ? ALL_TRACKS : String(values.trackId)}
            onValueChange={(v) => update('trackId', v === ALL_TRACKS ? null : Number(v))}
          >
            <SelectTrigger appearance="admin" aria-label="대상 분과" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_TRACKS}>전체</SelectItem>
              {tracks.map((track) => (
                <SelectItem key={track.trackId} value={String(track.trackId)}>
                  {track.trackName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="설명" align="start">
          <TextArea
            appearance="admin"
            aria-label="설명"
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="제출 항목에 대한 설명을 입력해주세요."
            rows={4}
            className="w-full text-base sm:text-sm"
          />
        </FormRow>

        <FormRow label="파일 형식" align="start">
          <FileFormatSelect value={values.fileFormats} onChange={(v) => update('fileFormats', v)} />
        </FormRow>

        <FormRow label="파일 크기">
          <Select value={String(values.maxFileSizeMb)} onValueChange={(v) => update('maxFileSizeMb', Number(v))}>
            <SelectTrigger appearance="admin" aria-label="파일 크기" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FILE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="파일 수">
          <NumberStepper value={values.maxFileCount} min={1} max={20} onChange={(v) => update('maxFileCount', v)} />
        </FormRow>

        <FormRow label="시작일시">
          <SubmissionDateTimeField value={values.startAt} onChange={(v) => update('startAt', v)} />
        </FormRow>

        <FormRow label="마감일시">
          <SubmissionDateTimeField value={values.endAt} onChange={(v) => update('endAt', v)} />
        </FormRow>

        <FormRow label="지각 제출 허용">
          <div className="border-input flex w-full overflow-hidden rounded-md border">
            <ToggleOption active={values.allowLateSubmission} onClick={() => update('allowLateSubmission', true)}>
              허용
            </ToggleOption>
            <div className="bg-input w-px" />
            <ToggleOption active={!values.allowLateSubmission} onClick={() => update('allowLateSubmission', false)}>
              허용 안 함
            </ToggleOption>
          </div>
        </FormRow>

        <FormRow label={<VisibilityLabel />}>
          <Select value={values.visibility} onValueChange={(v) => update('visibility', v as SubmissionVisibility)}>
            <SelectTrigger appearance="admin" aria-label="공개 범위" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((key) => (
                <SelectItem key={key} value={key}>
                  {VISIBILITY_LABEL[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>
      </fieldset>

      <AdminFormError message={isError ? '저장에 실패했어요. 입력 내용을 확인하고 다시 시도해주세요.' : undefined} />
      <div className="flex justify-end gap-3">
        <DialogClose asChild>
          <AdminActionButton variant="outline" onClick={onClose} disabled={isPending}>
            취소
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton onClick={handleSubmit} disabled={isPending} aria-busy={isPending}>
          {isPending ? '저장 중…' : mode === 'create' ? '추가' : '수정'}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface FormRowProps {
  label: ReactNode;
  align?: 'center' | 'start';
  children: ReactNode;
}

const FormRow = ({ label, align = 'center', children }: FormRowProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-2 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-4',
        align === 'center' ? 'items-center' : 'items-start',
      )}
    >
      <div className={cn('text-darkGray text-sm font-medium', align === 'start' && 'sm:pt-2')}>{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
};

const ToggleOption = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'focus-visible:outline-mainBlue min-h-11 flex-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
        active ? 'text-mainBlue bg-blue-50' : 'bg-white text-neutral-600 hover:bg-gray-50',
      )}
    >
      {children}
    </button>
  );
};

const NumberStepper = ({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) => {
  return (
    <div className="border-input flex h-11 w-36 items-center justify-between rounded-md border px-1">
      <button
        type="button"
        aria-label="파일 수 줄이기"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="hover:text-darkGray flex size-11 items-center justify-center text-neutral-600 disabled:opacity-40"
        disabled={value <= min}
      >
        <Minus size={14} />
      </button>
      <span className="text-sm">{value}</span>
      <button
        type="button"
        aria-label="파일 수 늘리기"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="hover:text-darkGray flex size-11 items-center justify-center text-neutral-600 disabled:opacity-40"
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

const VisibilityLabel = () => {
  return (
    <span className="flex items-center gap-1">
      공개 범위
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label="공개 범위 안내">
            <LuInfo size={14} className="text-neutral-600" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          collisionPadding={16}
          className="w-96 max-w-[calc(100vw-32px)] border-0 bg-neutral-900 p-4 text-white shadow-sm"
          arrowClassName="bg-neutral-900 fill-neutral-900"
        >
          <div className="mb-3 flex items-center gap-2">
            <LuInfo size={16} className="shrink-0" />
            <span className="text-sm font-medium">제출된 자료를 열람할 수 있는 범위를 설정합니다.</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {VISIBILITY_OPTIONS.map((key) => (
              <li key={key} className="flex items-start gap-2">
                <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                  {VISIBILITY_LABEL[key]}
                </span>
                <span className="text-xs leading-relaxed text-white/80">{VISIBILITY_DESCRIPTION[key]}</span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </span>
  );
};
