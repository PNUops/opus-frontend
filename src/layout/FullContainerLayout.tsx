import { Outlet } from 'react-router-dom';

const FullContainerLayout = () => {
  return (
    <div className="container mx-auto my-10 min-h-screen px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-48">
      <Outlet />
    </div>
  );
};

export default FullContainerLayout;
