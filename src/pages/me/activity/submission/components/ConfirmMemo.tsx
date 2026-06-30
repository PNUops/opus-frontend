import { useState } from 'react';

import { AdminActionButton } from '@components/admin';
import type { ConfirmMemoResponseDto } from '@dto/meDto';

const MAX_LENGTH = 500;

interface ConfirmMemoProps {
  /** 기존 메모 (조회 결과, 없으면 null) */
  memo: ConfirmMemoResponseDto | null;
  /** 저장 시 호출 (메모 없으면 생성, 있으면 수정) */
  onSave: (content: string) => void;
  /** 삭제 시 호출 */
  onDelete: () => void;
}

/** 확인 메모 (UI 전용) — 보기/편집 토글 */
export const ConfirmMemo = ({ memo, onSave, onDelete }: ConfirmMemoProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(memo?.content ?? '');

  // memo가 로딩(null) → 도착으로 바뀌면 보기/내용 state를 다시 동기화
  const [prevMemo, setPrevMemo] = useState(memo);
  if (memo !== prevMemo) {
    setPrevMemo(memo);
    setIsEditing(memo === null);
    setContent(memo?.content ?? '');
  }

  const startEdit = () => {
    setContent(memo?.content ?? '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setContent(memo?.content ?? '');
    setIsEditing(false);
  };

  const isEmpty = content.trim().length === 0;

  const handleSave = () => {
    if (isEmpty) return;
    onSave(content.trim());
    setIsEditing(false);
  };

  // 편집 모드: textarea + 저장하기 / 취소하기
  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="재제출 계획, 반영할 내용 등을 메모하세요."
          rows={2}
          className="border-lightGray focus:border-mainGreen placeholder:text-midGray w-full resize-none rounded-lg border p-3 text-sm focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-midGray text-xs">
            {content.length}/{MAX_LENGTH}자
          </span>
          <div className="flex gap-2">
            <AdminActionButton variant="outline" size="sm" onClick={handleCancel}>
              취소하기
            </AdminActionButton>
            <AdminActionButton
              size="sm"
              className="bg-mainGreen hover:bg-green-700"
              onClick={handleSave}
              disabled={isEmpty}
            >
              저장하기
            </AdminActionButton>
          </div>
        </div>
      </div>
    );
  }

  // 메모 없음: 작성 진입
  if (!memo) {
    return (
      <div className="border-lightGray flex items-center justify-between gap-3 rounded-lg border border-dashed p-3">
        <span className="text-midGray text-sm">작성된 메모가 없어요.</span>
        <AdminActionButton size="sm" className="bg-mainGreen hover:bg-green-700" onClick={startEdit}>
          메모 작성하기
        </AdminActionButton>
      </div>
    );
  }

  // 보기 모드: 내용 + 수정하기 / 삭제하기
  return (
    <div className="border-lightGray flex flex-col gap-3 rounded-lg border p-3">
      <p className="text-darkGray text-sm leading-relaxed whitespace-pre-wrap">{memo.content}</p>
      <div className="flex justify-end gap-2">
        <AdminActionButton variant="outline" size="sm" onClick={startEdit}>
          수정하기
        </AdminActionButton>
        <AdminActionButton
          variant="outline"
          size="sm"
          className="border-mainRed text-mainRed hover:bg-red-50"
          onClick={onDelete}
        >
          삭제하기
        </AdminActionButton>
      </div>
    </div>
  );
};
