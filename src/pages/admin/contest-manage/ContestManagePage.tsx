import ContestDelete from './ContestDelete';
import ContestEdit from './ContestEdit';

const ContestSettingsPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <ContestEdit />
      <ContestDelete />
    </div>
  );
};

export default ContestSettingsPage;
