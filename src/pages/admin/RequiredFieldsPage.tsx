import React, { useState } from 'react';
import RequiredFields from '@components/RequiredFields';
import { Button } from '@components/ui/button';
import { useToast } from 'hooks/useToast';

const DEFAULT_FIELDS = [
  '대회 이름',
  '분과 이름',
  '프로젝트 이름',
  '팀 이름',
  '팀장 이름',
  '지도교수 이름',
  '팀원',
  '깃헙 링크',
  '유튜브 링크',
  '포스터',
  '이미지',
  '개요',
];

const RequiredFieldsPage: React.FC = () => {
  const [fields, setFields] = useState(
    DEFAULT_FIELDS.map((label) => ({
      label,
      required: ['대회 이름', '분과 이름', '프로젝트 이름', '팀 이름', '팀장 이름'].includes(label),
    })),
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const toggleField = (index: number) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], required: !next[index].required };
      return next;
    });
  };

  const toggleAll = (value: boolean) => {
    setFields((prev) => prev.map((f) => ({ ...f, required: value })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: call API to persist settings. For now just show toast.
      await new Promise((r) => setTimeout(r, 400));
      toast('설정이 저장되었습니다', 'success');
    } catch (e) {
      toast('설정 저장에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title mb-2 font-bold">필수 항목 설정</h2>
          <p className="text-sm text-gray-500">프로젝트 제출 폼에서 어떤 항목이 필수인지 설정합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-mainBlue hover:bg-blue-600" onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </header>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <RequiredFields fields={fields} onToggle={toggleField} />
      </section>
    </div>
  );
};

export default RequiredFieldsPage;
