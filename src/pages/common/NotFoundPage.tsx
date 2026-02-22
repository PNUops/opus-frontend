import { TbError404 } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import FullContainer from '@layout/FullContainer';

const NotFound = () => {
  return (
    <FullContainer>
      <div className="flex h-[500px] flex-col items-center justify-center">
        <TbError404 className="stroke-mainGreen" size={150} />
        <div className="flex flex-col items-center gap-7">
          <p className="text-center text-lg whitespace-pre-wrap">{`페이지를 찾을 수 없습니다.\n주소가 올바른지 다시 한번 확인해주세요.`}</p>
          <Link to="/" className="bg-mainGreen w-fit rounded-lg px-4 py-2 text-lg text-white">
            메인으로 이동
          </Link>
        </div>
      </div>
    </FullContainer>
  );
};

export default NotFound;
