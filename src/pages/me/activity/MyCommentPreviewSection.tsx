import { Link } from 'react-router-dom';
import { MyPageSection } from '../mypageSection';
import { FaChevronRight } from 'react-icons/fa6';
import { FaRegCommentAlt } from 'react-icons/fa';

const MyCommentPreviewSection = () => {
  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <FaRegCommentAlt className="text-mainGreen size-5" />
        <p className="text-base sm:text-lg">댓글</p>
        <Link to="/me/activity/comments" className="text-midGray ml-auto">
          <FaChevronRight />
        </Link>
      </MyPageSection.Header>
    </MyPageSection.Root>
  );
};

export default MyCommentPreviewSection;
