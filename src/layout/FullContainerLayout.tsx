import { Outlet } from 'react-router-dom';
import FullContainer from './FullContainer';

const FullContainerLayout = () => {
  return (
    <main>
      <FullContainer>
        <Outlet />
      </FullContainer>
    </main>
  );
};

export default FullContainerLayout;
