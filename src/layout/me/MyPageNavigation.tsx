import { Link } from 'react-router-dom';

const MyPageNavigation = () => {
  return (
    <nav className="flex">
      <Link to="/me/activity" className="hover:text-mainGreen px-4 py-2 text-sm font-medium text-gray-700">
        나의 활동
      </Link>
      <Link to="/me/account" className="hover:text-mainGreen px-4 py-2 text-sm font-medium text-gray-700">
        계정 정보
      </Link>
    </nav>
  );
};

export default MyPageNavigation;
