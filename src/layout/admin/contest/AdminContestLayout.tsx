import LayoutTopBar from './LayoutTopBar';
import LayoutSideBar from './LayoutSideBar';
import FullContainerLayout from '@layout/FullContainerLayout';

const AdminContestLayout = () => {
  return (
    <>
      <LayoutTopBar />
      <div className="flex">
        <LayoutSideBar />
        <div className="flex-1 border-l">
          <FullContainerLayout />
        </div>
      </div>
    </>
  );
};

export default AdminContestLayout;
