import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, LoaderCircle, RefreshCw } from 'lucide-react';
import dayjs from 'dayjs';
import { AdminActionButton } from '@components/admin';
import { voteReportOption } from '@queries/voteReport';
import { useVoteReportPdf } from './hooks/useVoteReportPdf';
import { VoteReportPdfDialog } from './VoteReportPdfDialog';
import StatCardsSection from './StatCardsSection';
import VoteRankingSection from './VoteRankingSection';

const formatTime = (value: string) => (dayjs(value).isValid() ? dayjs(value).format('YYYY.MM.DD HH:mm') : '—');
const outlineClass =
  'min-h-11 text-neutral-700 shadow-none hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mainBlue';

export const VoteReportSection = ({ contestId }: { contestId: number }) => {
  const query = useQuery(voteReportOption(contestId));
  const report = query.data;
  const pdf = useVoteReportPdf(contestId, report?.isVoteEnded === true);
  const previewTrigger = useRef<HTMLButtonElement>(null);

  return (
    <section aria-labelledby="vote-report-title" className="flex min-w-0 flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 id="vote-report-title" className="text-2xl leading-8 font-semibold text-neutral-900">
              투표 리포트
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              투표 현황과 순위를 확인하고 결과를 PDF로 보관할 수 있어요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminActionButton
              variant="outline"
              size="icon"
              className={`${outlineClass} size-11 shrink-0`}
              disabled={!report || query.isFetching || pdf.isLoading}
              onClick={() => void query.refetch()}
              aria-label="리포트 새로고침"
              title="리포트 새로고침"
            >
              <RefreshCw
                size={18}
                aria-hidden
                className={query.isFetching ? 'animate-spin motion-reduce:animate-none' : ''}
              />
            </AdminActionButton>
            <AdminActionButton
              ref={previewTrigger}
              variant="outline"
              className={outlineClass}
              disabled={!report?.isVoteEnded || pdf.isLoading}
              onClick={() => void pdf.preview()}
              aria-describedby="pdf-availability"
            >
              <Eye size={18} aria-hidden /> PDF 미리보기
            </AdminActionButton>
            <AdminActionButton
              className="focus-visible:outline-mainBlue min-h-11 shadow-none hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2"
              disabled={!report?.isVoteEnded || pdf.isLoading}
              onClick={() => void pdf.download()}
              aria-busy={pdf.isLoading && pdf.state.status === 'loading' && pdf.state.mode === 'download'}
              aria-describedby="pdf-availability"
            >
              {pdf.isLoading ? (
                <LoaderCircle size={18} aria-hidden className="animate-spin motion-reduce:animate-none" />
              ) : (
                <Download size={18} aria-hidden />
              )}
              PDF 다운로드
            </AdminActionButton>
          </div>
        </div>
        <p id="pdf-availability" className="text-sm leading-6 text-neutral-600">
          {report?.isVoteEnded
            ? 'PDF는 요청 시점의 데이터로 생성돼요. 기간이나 팀 정보가 변경되면 결과도 달라질 수 있어요.'
            : 'PDF 미리보기와 다운로드는 투표 마감 후에 사용할 수 있어요.'}
        </p>
        {pdf.state.status === 'error' && pdf.state.mode === 'download' && (
          <p role="alert" className="text-sm leading-6 break-words text-red-700">
            {pdf.state.message}
          </p>
        )}
      </header>

      {query.isError && (
        <div role="alert" className="border-lightGray flex flex-wrap items-center justify-between gap-3 border-y py-5">
          <p className="text-sm leading-6 text-red-700">
            {report
              ? '최신 집계를 가져오지 못했어요. 아래는 마지막 조회 결과입니다.'
              : '투표 리포트를 불러오지 못했어요.'}
          </p>
          <AdminActionButton
            variant="outline"
            className={outlineClass}
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            다시 시도
          </AdminActionButton>
        </div>
      )}
      {query.isPending ? (
        <div role="status" className="flex min-h-64 items-center justify-center gap-3 text-sm text-neutral-600">
          <LoaderCircle aria-hidden size={20} className="animate-spin motion-reduce:animate-none" />
          투표 리포트를 불러오고 있어요.
        </div>
      ) : report ? (
        <>
          <div className="border-lightGray flex flex-col gap-4 border-b pb-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="min-w-0 text-lg leading-7 font-medium break-words text-neutral-900">
                {report.contestName}
              </h2>
              <span
                className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium ${report.isVoteEnded ? 'bg-whiteGray text-neutral-700' : 'bg-mainBlue/10 text-mainBlue'}`}
              >
                {report.isVoteEnded ? '투표 마감' : '중간 집계'}
              </span>
            </div>
            <dl className="grid gap-x-8 gap-y-2 text-sm leading-6 text-neutral-700 sm:grid-cols-2">
              <div>
                <dt className="text-neutral-500">투표 기간</dt>
                <dd>
                  <time dateTime={report.voteStartAt}>{formatTime(report.voteStartAt)}</time>
                  <span className="mx-1">—</span>
                  <wbr />
                  <time dateTime={report.voteEndAt}>{formatTime(report.voteEndAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">집계 기준</dt>
                <dd>
                  <time dateTime={report.aggregatedAt}>{formatTime(report.aggregatedAt)}</time>
                  <span className="ml-3">1인당 최대 {report.maxVotesLimit.toLocaleString('ko-KR')}표</span>
                </dd>
              </div>
            </dl>
          </div>
          <StatCardsSection report={report} />
          <VoteRankingSection rankings={report.rankings} />
        </>
      ) : null}
      <VoteReportPdfDialog
        pdf={pdf}
        contestName={report?.contestName ?? ''}
        onCloseFocus={() => previewTrigger.current?.focus()}
      />
    </section>
  );
};
