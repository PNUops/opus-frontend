const FullContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="container mx-auto my-10 min-h-screen px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-48">{children}</div>
  );
};

export default FullContainer;
