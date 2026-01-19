import { useState } from 'react';

interface RequiredField {
  id: string;
  label: string;
  required: boolean;
}

const RequiredFieldsPage = () => {
  const [fields, setFields] = useState<RequiredField[]>([
    { id: 'contestName', label: '대회 이름', required: true },
    { id: 'departmentName', label: '분야 이름', required: true },
    { id: 'projectName', label: '프로젝트 이름', required: true },
    { id: 'teamName', label: '팀 이름', required: true },
    { id: 'memberName', label: '팀원 이름', required: true },
    { id: 'advisorName', label: '지도교수 이름', required: false },
    { id: 'homeroom', label: '담임', required: false },
    { id: 'githubLink', label: '깃팀 링크', required: false },
    { id: 'youtubeLink', label: '유튜브 링크', required: false },
    { id: 'poster', label: '포스터', required: false },
    { id: 'image', label: '이미지', required: false },
    { id: 'game', label: '게임', required: false },
  ]);

  const handleToggleField = (id: string) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, required: !field.required } : field)));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">필수 항목 설정</h1>
      <div className="border-lightGray rounded-xl border p-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-4 text-left text-base font-medium text-gray-700">필드명</th>
              <th className="pb-4 text-right text-base font-medium text-gray-700">필수</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className={`${index !== fields.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <td className="py-4 text-left text-base text-gray-900">{field.label}</td>
                <td className="py-4 text-right">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => handleToggleField(field.id)}
                    className="h-5 w-5 cursor-pointer accent-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequiredFieldsPage;
