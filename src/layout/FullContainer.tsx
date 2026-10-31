const FullContainer = ({ children, fillViewport = true }: { children: React.ReactNode; fillViewport?: boolean }) => {
  return (
    <div
      className={`container mx-auto my-10 px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-48 ${fillViewport ? 'min-h-screen' : ''}`}
    >
      {children}
    </div>
  );
};

export default FullContainer;
