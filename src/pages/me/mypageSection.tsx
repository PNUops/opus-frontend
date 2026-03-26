type MyPageSectionProps = {
  children: React.ReactNode;
};

const MyPageSectionRoot = ({ children }: MyPageSectionProps) => {
  return <section className="flex w-full flex-col gap-4 p-2 sm:gap-5 sm:p-4 md:p-6">{children}</section>;
};

const MyPageSectionHeader = ({ children }: MyPageSectionProps) => {
  return <div className="flex items-center gap-2 text-base font-bold sm:text-lg">{children}</div>;
};

const MyPageSectionDescription = ({ children }: MyPageSectionProps) => {
  return <div className="text-midGray text-xs sm:text-sm">{children}</div>;
};

const MyPageSectionBody = ({ children }: MyPageSectionProps) => {
  return <div className="flex flex-col gap-3 sm:gap-4">{children}</div>;
};

export const MyPageSection = {
  Root: MyPageSectionRoot,
  Header: MyPageSectionHeader,
  Description: MyPageSectionDescription,
  Body: MyPageSectionBody,
};
