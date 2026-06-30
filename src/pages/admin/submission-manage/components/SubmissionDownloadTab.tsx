import { useMemo, useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';

import { AdminActionButton } from '@components/admin';
import Checkbox from '@components/ui/Checkbox';
import FilterDropDown from '@components/FilterDropDown';
import { useToast } from '@hooks/useToast';
import { useContestIdOrRedirect } from '@hooks/useId';
import { postSubmissionDownloads } from '@apis/submission';
import { submissionDownloadsOption } from '@queries/submission';
import { downloadFromResponse } from '@utils/download';
import { getApiErrorMessage } from '@utils/error';
import type { SubmissionArchiveResponseDto, SubmissionDownloadTargetDto } from '@dto/submissionDto';

const TABLE_HEADERS = ['제출 항목', '분과', '제출 팀 수', '예상 용량'];

const rowKey = (archive: SubmissionArchiveResponseDto) => `${archive.submissionTypeId}-${archive.trackId}`;

/** bytes → 사람이 읽기 쉬운 용량 (MB/GB) */
const formatSize = (bytes: number) => {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${Math.round(mb)}MB`;
};

/** value/label 쌍을 중복 없이 추출해 FilterDropDown 옵션으로 변환 */
const toUniqueOptions = (
  archives: SubmissionArchiveResponseDto[],
  getValue: (a: SubmissionArchiveResponseDto) => number,
  getLabel: (a: SubmissionArchiveResponseDto) => string,
  placeholder: string,
) => {
  const map = new Map<string, string>();
  archives.forEach((a) => map.set(String(getValue(a)), getLabel(a)));
  return [{ label: placeholder, value: '' }, ...[...map].map(([value, label]) => ({ label, value }))];
};

export const SubmissionDownloadTab = () => {
  const toast = useToast();
  const contestId = useContestIdOrRedirect();
  const [typeFilter, setTypeFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const { data } = useSuspenseQuery(submissionDownloadsOption(contestId));
  const archives = data.targets;

  const downloadMutation = useMutation({
    mutationFn: (targets: SubmissionDownloadTargetDto[]) => postSubmissionDownloads(contestId, targets),
    onSuccess: (response) => {
      downloadFromResponse(response, '제출파일.zip');
      toast('다운로드를 시작했어요.', 'success');
    },
    onError: (error) => toast(getApiErrorMessage(error, '다운로드에 실패했어요.'), 'error'),
  });

  const toTarget = (archive: SubmissionArchiveResponseDto): SubmissionDownloadTargetDto => ({
    submissionTypeId: archive.submissionTypeId,
    trackId: archive.trackId,
  });

  const typeOptions = useMemo(
    () =>
      toUniqueOptions(
        archives,
        (a) => a.submissionTypeId,
        (a) => a.submissionItemName,
        '제출 항목',
      ),
    [archives],
  );
  const trackOptions = useMemo(
    () =>
      toUniqueOptions(
        archives,
        (a) => a.trackId,
        (a) => a.trackName,
        '분과',
      ),
    [archives],
  );

  const filteredArchives = useMemo(
    () =>
      archives.filter(
        (a) =>
          (typeFilter === '' || String(a.submissionTypeId) === typeFilter) &&
          (trackFilter === '' || String(a.trackId) === trackFilter),
      ),
    [archives, typeFilter, trackFilter],
  );

  const isAllSelected = filteredArchives.length > 0 && filteredArchives.every((a) => selectedKeys.has(rowKey(a)));

  const toggleRow = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      filteredArchives.forEach((a) => (checked ? next.add(rowKey(a)) : next.delete(rowKey(a))));
      return next;
    });
  };

  const handleReset = () => {
    setTypeFilter('');
    setTrackFilter('');
    setSelectedKeys(new Set());
  };

  const handleDownloadSelected = () => {
    if (selectedKeys.size === 0) return;
    const targets = archives.filter((a) => selectedKeys.has(rowKey(a))).map(toTarget);
    downloadMutation.mutate(targets);
  };

  const handleDownloadRow = (archive: SubmissionArchiveResponseDto) => {
    downloadMutation.mutate([toTarget(archive)]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterDropDown
            variant="select"
            label={typeOptions.find((o) => o.value === typeFilter)?.label ?? '제출 항목'}
            value={typeFilter}
            options={typeOptions}
            onChange={setTypeFilter}
          />
          <FilterDropDown
            variant="select"
            label={trackOptions.find((o) => o.value === trackFilter)?.label ?? '분과'}
            value={trackFilter}
            options={trackOptions}
            onChange={setTrackFilter}
          />
          <button
            type="button"
            onClick={handleReset}
            aria-label="필터 초기화"
            className="border-lightGray text-midGray flex h-8.5 w-8.5 items-center justify-center rounded-sm border transition-colors hover:bg-gray-100"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <AdminActionButton
          size="sm"
          onClick={handleDownloadSelected}
          disabled={selectedKeys.size === 0 || downloadMutation.isPending}
        >
          <Download size={16} />
          선택 다운로드
        </AdminActionButton>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-lightGray border-b">
              <th className="w-12 px-4 py-3">
                <div className="flex justify-center">
                  <Checkbox checked={isAllSelected} onChange={toggleAll} ariaLabel="전체 선택" />
                </div>
              </th>
              {TABLE_HEADERS.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-medium whitespace-nowrap">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredArchives.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length + 2} className="text-midGray py-12 text-center text-sm">
                  다운로드할 제출물이 없어요.
                </td>
              </tr>
            ) : (
              filteredArchives.map((archive) => {
                const key = rowKey(archive);
                return (
                  <tr key={key} className="border-lightGray border-b last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedKeys.has(key)}
                          onChange={() => toggleRow(key)}
                          ariaLabel={`${archive.submissionItemName} ${archive.trackName} 선택`}
                        />
                      </div>
                    </td>
                    <td className="text-darkGray px-4 py-4 text-sm font-medium whitespace-nowrap">
                      {archive.submissionItemName}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">{archive.trackName}</td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                      {archive.submittedTeamCount}개
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap text-gray-600">
                      {formatSize(archive.estimatedSize)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <AdminActionButton
                          size="icon"
                          className="h-8 w-8"
                          aria-label="다운로드"
                          onClick={() => handleDownloadRow(archive)}
                        >
                          <Download size={16} />
                        </AdminActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
