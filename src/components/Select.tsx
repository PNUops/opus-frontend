import { IoIosArrowDown } from 'react-icons/io';
import { cn } from 'utils/classname';

const Select = ({
  children,
  className,
  ...rest
}: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) => {
  return (
    <div className="relative inline-block">
      <select
        className={cn(
          'border-subGreen cursor-pointer appearance-none rounded border-b-2 bg-white px-4 py-2 pr-10 text-nowrap focus:outline-none',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <IoIosArrowDown className="text-mainGreen pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-lg" />
    </div>
  );
};

export default Select;
