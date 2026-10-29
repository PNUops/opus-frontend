import { Download, LoaderCircle } from 'lucide-react';
import { AdminActionButton } from '@components/admin';
import { Dialog, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useVoteReportPdf } from './hooks/useVoteReportPdf';

interface VoteReportPdfDialogProps {
  pdf: ReturnType<typeof useVoteReportPdf>;
  contestName: string;
  onCloseFocus: () => void;
}

export const VoteReportPdfDialog = ({ pdf, contestName, onCloseFocus }: VoteReportPdfDialogProps) => (
  <Dialog open={pdf.isOpen} onOpenChange={(open) => !open && pdf.close()}>
    <DialogContent
      className="flex h-[min(900px,calc(100dvh-32px))] w-[calc(100vw-32px)] max-w-6xl items-stretch gap-4 rounded-lg p-4 pt-6 sm:p-6 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        onCloseFocus();
      }}
    >
      <div className="min-w-0 pr-10">
        <DialogTitle className="text-left text-lg font-semibold text-neutral-900">투표 리포트 PDF</DialogTitle>
        <p className="mt-1 truncate text-sm text-neutral-600" title={contestName}>
          {contestName}
        </p>
      </div>
      {pdf.state.status === 'ready' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm leading-6 text-neutral-600">미리보기가 표시되지 않으면 PDF를 다운로드해 주세요.</p>
            <AdminActionButton className="min-h-11 shadow-none hover:shadow-none" onClick={() => void pdf.download()}>
              <Download size={18} aria-hidden /> PDF 다운로드
            </AdminActionButton>
          </div>
          {navigator.pdfViewerEnabled === false ? (
            <div className="border-lightGray flex min-h-0 flex-1 items-center justify-center rounded border px-6 text-center text-sm leading-6 text-neutral-600">
              이 브라우저에서는 PDF 미리보기를 지원하지 않아요. 위의 다운로드 버튼으로 파일을 열어 주세요.
            </div>
          ) : (
            <iframe
              title="투표 리포트 PDF 미리보기"
              src={`${pdf.state.url}#view=FitH&navpanes=0`}
              className="border-lightGray bg-whiteGray min-h-0 w-full flex-1 rounded border"
            />
          )}
        </>
      ) : pdf.state.status === 'error' ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <p role="alert" className="max-w-lg text-sm leading-6 break-words text-red-700">
            {pdf.state.message}
          </p>
          <AdminActionButton className="min-h-11" onClick={() => void pdf.preview()}>
            다시 시도
          </AdminActionButton>
        </div>
      ) : (
        <div role="status" className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-neutral-600">
          <LoaderCircle size={24} aria-hidden className="animate-spin motion-reduce:animate-none" />
          <p>PDF를 준비하고 있어요.</p>
        </div>
      )}
    </DialogContent>
  </Dialog>
);
