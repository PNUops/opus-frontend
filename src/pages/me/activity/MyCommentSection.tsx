import { Link } from 'react-router-dom';
import { ActivitySection } from './ActivityTab';
import { FaChevronRight } from 'react-icons/fa6';
import { FaRegCommentAlt } from 'react-icons/fa';

const MyCommentSection = () => {
  return (
    <ActivitySection.Root>
      <ActivitySection.Header>
        <FaRegCommentAlt className="text-mainGreen size-6" />
        <p className="text-base sm:text-lg">댓글</p>
        <Link to="/me/activity/comments" className="text-midGray ml-auto">
          <FaChevronRight />
        </Link>
      </ActivitySection.Header>
    </ActivitySection.Root>
  );
};

export default MyCommentSection;
