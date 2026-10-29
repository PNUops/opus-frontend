import { AdminCard, AdminCardTop } from '@components/admin';

const DEVELOPMENT_PLAN_URL = 'https://fuchsia-tabletop-6fc.notion.site/2025-SW-23edea889b87802e8ab2f4561ddd5a50';

const ServiceInfoSection = () => {
  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">서비스 관련 정보</h2>
      </AdminCardTop>
      <div className="min-w-0 p-5">
        <a
          href={DEVELOPMENT_PLAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mainBlue inline-flex min-h-11 items-center leading-6 break-words underline underline-offset-4"
        >
          2025 SW프로젝트 관리시스템 개발 계획
        </a>
      </div>
    </AdminCard>
  );
};

export default ServiceInfoSection;
