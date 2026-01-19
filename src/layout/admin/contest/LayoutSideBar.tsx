import { NavLink } from 'react-router-dom';
import { cn } from 'utils/classname';

interface LayoutSideBarProps {
  sections: {
    title: string;
    links: { to: string; label: string }[];
  }[];
}

const LayoutSideBar = ({ sections }: LayoutSideBarProps) => {
  const baseStyle = 'transition-all hover:text-mainGreen';
  const activeLinkStyle = 'font-semibold text-mainGreen';
  const getLinkClass = ({ isActive }: { isActive: boolean }) => cn(baseStyle, isActive && activeLinkStyle);

  return (
    <aside className="flex flex-col gap-6 p-8">
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="py-2 text-lg font-semibold">{section.title}</h2>
          <ul className="flex flex-col gap-2 pl-2">
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} className={getLinkClass}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
};
export default LayoutSideBar;
