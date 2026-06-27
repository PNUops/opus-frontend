import { NavLink, useLocation } from 'react-router-dom';
import { Activity, CircleUserRound } from 'lucide-react';
import { cn } from '@utils/classname';

type LayoutSidebarIcon = 'activity' | 'account';

export interface LayoutSidebarLink {
  key?: string;
  to?: string;
  label: string;
  icon?: LayoutSidebarIcon;
  activePaths?: string[];
  links?: LayoutSidebarLink[];
}

export interface LayoutSidebarSection {
  title: string;
  links: LayoutSidebarLink[];
}

interface LayoutSideBarProps {
  sections: LayoutSidebarSection[];
}

const LayoutSideBar = ({ sections }: LayoutSideBarProps) => {
  const { pathname } = useLocation();
  const baseStyle = 'flex min-w-0 items-center gap-3 truncate transition-all hover:text-mainGreen';
  const activeLinkStyle = 'font-semibold text-mainGreen';

  const renderIcon = (icon?: LayoutSidebarIcon) => {
    if (icon === 'activity') {
      return <Activity size={20} className="shrink-0" />;
    }

    if (icon === 'account') {
      return <CircleUserRound size={20} className="shrink-0" />;
    }

    return null;
  };

  const renderLink = (link: LayoutSidebarLink, depth = 0) => {
    const hasChildren = !!link.links?.length;
    const parentStyle =
      depth === 0
        ? 'rounded-lg px-4 py-3 text-base font-semibold'
        : depth === 1
          ? 'py-1 text-sm font-semibold text-neutral-900'
          : 'py-0.5 text-sm text-neutral-700';
    const matchesActivePath = link.activePaths?.some((path) => pathname.startsWith(path)) ?? false;

    const getLinkClass = ({ isActive }: { isActive: boolean }) => {
      const active = isActive || matchesActivePath;
      return cn(
        baseStyle,
        parentStyle,
        active && activeLinkStyle,
        depth === 0 && active && 'bg-subGreen text-mainGreen',
      );
    };

    return (
      <li key={`${depth}-${link.key ?? link.to ?? link.label}`} className={cn(hasChildren && 'flex flex-col gap-2')}>
        {link.to ? (
          <NavLink to={link.to} className={getLinkClass} title={link.label}>
            {renderIcon(link.icon)}
            <span className="truncate">{link.label}</span>
          </NavLink>
        ) : (
          <p
            className={cn(
              'flex min-w-0 items-center gap-3 truncate font-semibold text-neutral-900',
              parentStyle,
              depth > 0 && 'text-sm',
              depth === 0 && 'text-base',
            )}
            title={link.label}
          >
            {renderIcon(link.icon)}
            <span className="truncate">{link.label}</span>
          </p>
        )}
        {hasChildren && (
          <ul className={cn('border-mainGreen/30 flex flex-col gap-2 border-l pl-4', depth === 0 ? 'ml-5' : 'ml-2')}>
            {link.links?.map((child) => renderLink(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside className="flex flex-col gap-5 p-5 md:p-6">
      {sections.map((section) => (
        <section key={section.title}>
          {section.title && <h2 className="py-2 text-lg font-semibold text-nowrap">{section.title}</h2>}
          <ul className="flex flex-col gap-3">{section.links.map((link) => renderLink(link))}</ul>
        </section>
      ))}
    </aside>
  );
};
export default LayoutSideBar;
