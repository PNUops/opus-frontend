import useContests from '@hooks/useContests';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HeaderMenu = () => {
  return (
    <div className="flex-1 font-semibold md:text-lg lg:text-xl">
      <HistoryMenu />
    </div>
  );
};
export default HeaderMenu;

const HistoryMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useContests();

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button type="button" className="hover:text-mainGreen block p-4 text-nowrap" onClick={() => setIsOpen(!isOpen)}>
        히스토리
      </button>
      {isOpen && data && (
        <ul className="border-subGreen absolute z-50 w-fit border-2 bg-white text-base font-normal text-nowrap">
          {data?.map((item) => (
            <li key={item.contestId}>
              <Link
                to={`/contest/${item.contestId}`}
                className="hover:text-mainGreen hover:bg-whiteGray block p-4 transition-colors duration-200 ease-in"
              >
                {item.contestName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
