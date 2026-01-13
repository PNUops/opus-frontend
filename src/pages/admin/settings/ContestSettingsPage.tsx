import ContestDelete from './ContestDelete';
import ContestEdit from './ContestEdit';

const ContestSettingsPage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <ContestEdit />
      <ContestDelete />
    </div>
  );
};

export default ContestSettingsPage;
