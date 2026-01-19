import LayoutSideBar from '@layout/admin/contest/LayoutSideBar';
import FullContainerLayout from '@layout/FullContainerLayout';

import { user_sections } from 'constants/sidebar';

const MyPageLayout = () => {
  return (
    <>
      <div className="flex">
        <LayoutSideBar sections={user_sections} />
        <div className="flex-1 border-l">
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default MyPageLayout;
