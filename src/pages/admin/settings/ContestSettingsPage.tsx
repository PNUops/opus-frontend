import ContestDelete from './ContestDelete';
import ContestNameEdit from './ContestNameEdit';

const ContestSettingsPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <ContestNameEdit />
      <ContestDelete />
    </div>
  );
};

export default ContestSettingsPage;
