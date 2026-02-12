import { useState } from 'react';
import CurrentBannerSection from './CurrentBannerSection';
import BannerUploadSection from './BannerUploadSection';

const BannerManagePage = () => {
  const [bannerVersion, setBannerVersion] = useState(Date.now());

  const handleBannerUpdate = () => setBannerVersion(Date.now());

  return (
    <div className="flex flex-col gap-10">
      <CurrentBannerSection bannerVersion={bannerVersion} onBannerUpdate={handleBannerUpdate} />
      <BannerUploadSection onBannerUpdate={handleBannerUpdate} />
    </div>
  );
};

export default BannerManagePage;
