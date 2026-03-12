import { Outlet } from 'react-router-dom';
import MyPageNavigation from './MyPageNavigation';

const MyPageLayout = () => {
  return (
    <div className="flex w-full flex-col gap-12">
      <MyPageNavigation />
      <Outlet />
    </div>
  );
};

export default MyPageLayout;
