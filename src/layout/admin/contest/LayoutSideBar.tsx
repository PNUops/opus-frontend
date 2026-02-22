import { NavLink } from 'react-router-dom';
import { cn } from 'utils/classname';

const LayoutSideBar = () => {
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

const sections = [
  {
    title: '프로젝트',
    links: [
      { to: 'projects', label: '프로젝트 관리' },
      { to: 'team-order', label: '정렬 관리' },
      { to: 'awards', label: '수상 관리' },
      { to: 'required-fields', label: '필수 항목 설정' },
    ],
  },
  {
    title: '대회',
    links: [
      { to: 'settings', label: '대회 관리' },
      { to: 'tracks', label: '분과 관리' },
      { to: 'votes', label: '투표 관리' },
      { to: 'notices', label: '공지 관리' },
      { to: 'banners', label: '배너 관리' },
    ],
  },
  {
    title: '통계',
    links: [{ to: 'statistics', label: '대회 통계' }],
  },
];
