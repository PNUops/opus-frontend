import { AdminCard, AdminCardTop } from '@components/admin';

const DEVELOPMENT_PLAN_URL = 'https://fuchsia-tabletop-6fc.notion.site/2025-SW-23edea889b87802e8ab2f4561ddd5a50';

const ServiceInfoSection = () => {
  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">서비스 관련 정보</h2>
      </AdminCardTop>
      <div className="flex items-center gap-3.5 p-3.5">
        <div className="bg-subGreen shrink-0 rounded-lg p-2.5">2025 SW프로젝트 관리시스템 개발 계획</div>
        <a href={DEVELOPMENT_PLAN_URL} target="_blank" className="break-all underline underline-offset-2">
          {DEVELOPMENT_PLAN_URL}
        </a>
      </div>
    </AdminCard>
  );
};

export default ServiceInfoSection;
