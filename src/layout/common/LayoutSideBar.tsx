import { NavLink, useLocation } from 'react-router-dom';
import { Activity, CircleUserRound } from 'lucide-react';
import { PiChalkboardTeacher } from 'react-icons/pi';
import { cn } from '@utils/classname';

type LayoutSidebarIcon = 'activity' | 'advisorActivity' | 'account';

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

  const getResolvedPath = (to?: string) => {
    if (!to) {
      return null;
    }

    if (to.startsWith('/')) {
      return to;
    }

    const basePath = pathname.split('/').filter(Boolean)[0];
    return basePath ? `/${basePath}/${to}` : `/${to}`;
  };

  const isCurrentLink = (link: LayoutSidebarLink) => {
    const matchesActivePath = link.activePaths?.some((path) => pathname.startsWith(path)) ?? false;
    const resolvedPath = getResolvedPath(link.to);

    return matchesActivePath || (resolvedPath !== null && pathname.startsWith(resolvedPath));
  };

  const hasActiveDescendant = (link: LayoutSidebarLink): boolean => {
    return isCurrentLink(link) || !!link.links?.some((child) => hasActiveDescendant(child));
  };

  const renderIcon = (icon?: LayoutSidebarIcon) => {
    if (icon === 'activity') {
      return <Activity size={20} className="shrink-0" />;
    }

    if (icon === 'account') {
      return <CircleUserRound size={20} className="shrink-0" />;
    }

    if (icon === 'advisorActivity') {
      return <PiChalkboardTeacher size={20} className="shrink-0" />;
    }

    return null;
  };

  const renderLink = (link: LayoutSidebarLink, depth = 0) => {
    const hasChildren = !!link.links?.length;
    const childActive = hasChildren && hasActiveDescendant(link);
    const parentStyle =
      depth === 0
        ? 'rounded-lg px-4 py-3 text-base font-semibold'
        : depth === 1
          ? 'py-1 text-sm font-semibold text-neutral-900'
          : 'py-0.5 text-sm text-neutral-700';

    const getLinkClass = ({ isActive }: { isActive: boolean }) => {
      const active = isActive || isCurrentLink(link) || childActive;
      return cn(
        baseStyle,
        parentStyle,
        active && activeLinkStyle,
        depth === 0 && active && 'bg-subGreen text-mainGreen',
      );
    };

    return (
      <li
        key={`${depth}-${link.key ?? link.to ?? link.label}`}
        className={cn(hasChildren && 'group/sidebar-link flex flex-col gap-2')}
      >
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
          <ul
            className={cn(
              'border-mainGreen/30 flex flex-col gap-2 overflow-hidden border-l pl-4 transition-all duration-200 ease-out',
              depth === 0 && 'ml-5',
              depth > 0 && 'ml-2',
              depth === 1 &&
                !childActive &&
                'max-h-0 opacity-0 group-focus-within/sidebar-link:max-h-40 group-focus-within/sidebar-link:opacity-100 group-hover/sidebar-link:max-h-40 group-hover/sidebar-link:opacity-100',
              (depth !== 1 || childActive) && 'max-h-96 opacity-100',
            )}
          >
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
