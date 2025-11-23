import { Outlet } from 'react-router-dom';
import FullContainer from './FullContainer';

const FullContainerLayout = () => {
  return (
    <FullContainer>
      <Outlet />
    </FullContainer>
  );
};

export default FullContainerLayout;
