import CurrentBannerSection from './CurrentBannerSection';
import BannerUploadSection from './BannerUploadSection';

const BannerManagePage = () => {
  return (
    <div className="flex flex-col gap-10">
      <CurrentBannerSection />
      <BannerUploadSection />
    </div>
  );
};

export default BannerManagePage;
