import { Link, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowUpRight, MessageSquareShare } from 'lucide-react';
import { EXTERNAL_LINKS } from '@constants/external-links';
import useAuth from '@hooks/useAuth';
import { cn } from '@utils/classname';

const headingClass = 'mb-3 text-sm leading-[1.8] font-semibold';
const descriptionClass =
  'mt-2.5 max-w-[340px] text-[13px] leading-[1.9] break-keep text-(--footer-muted) [overflow-wrap:anywhere]';
const linkClass =
  'inline-flex min-h-11 items-center gap-1.5 py-1.5 text-[13px] leading-[1.7] break-keep text-(--footer-muted) [overflow-wrap:anywhere] hover:text-(--footer-ink) hover:underline hover:underline-offset-4';

const Footer = () => {
  const location = useLocation();
  const isHomeRoute = location.pathname === '/';
  const isAuthRoute = ['/signin', '/signup'].includes(location.pathname.replace(/\/+$/, ''));
  const { isSignedIn } = useAuth();

  return (
    <footer
      className={cn(
        'w-full bg-(--footer-surface) text-(--footer-ink) [&_:focus-visible]:rounded-[4px] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-(--footer-accent)',
        isHomeRoute
          ? 'mt-0 border-t border-(--footer-line) [--footer-accent:#45d6ec] [--footer-button:#0a2242] [--footer-ink:#f8f6f0] [--footer-line:rgb(229_240_252/18%)] [--footer-muted:#a9b8c9] [--footer-surface:#06172f]'
          : '[--footer-accent:#005baa] [--footer-button:#fff] [--footer-ink:#262626] [--footer-line:#e2e6eb] [--footer-muted:#667085] [--footer-surface:#f7f8fa]',
        !isHomeRoute && !isAuthRoute && 'mt-footer',
      )}
    >
      <div className="mx-auto max-w-[1448px] px-6 pt-12 pb-4 lg:px-12 lg:pt-14 lg:pb-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-9 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-12 lg:pb-11 [&>*]:min-w-0">
          <div className="col-span-full lg:col-span-1">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-3 text-[30px] font-bold tracking-[-0.04em]"
              aria-label="OPUS 홈으로"
            >
              <img
                src="/swOpsLogo-sm.png"
                alt=""
                width={32}
                height={32}
                className={cn('size-8 object-contain', isHomeRoute && 'brightness-0 invert')}
              />
              <span>OPUS</span>
            </Link>
            <p className="mt-3 text-[13px] leading-[1.8] font-medium [overflow-wrap:anywhere] break-keep">
              부산대학교 SW프로젝트관리시스템
            </p>
            <p className={descriptionClass}>
              아이디어가 프로젝트로, 프로젝트가 작품으로.
              <br />
              대회와 팀의 성과를 한곳에 모으고 함께 나눕니다.
            </p>
          </div>

          <nav aria-labelledby="footer-explore-title">
            <h2 id="footer-explore-title" className={headingClass}>
              둘러보기
            </h2>
            <ul>
              <li>
                <Link to="/" className={linkClass}>
                  대회·프로젝트
                </Link>
              </li>
              <li>
                <Link to="/notices" className={linkClass}>
                  전체 공지사항
                </Link>
              </li>
              <li>
                {isSignedIn ? (
                  <Link to="/me/activity" className={linkClass}>
                    내 활동
                  </Link>
                ) : (
                  <Link to="/signin" className={linkClass}>
                    로그인 / 회원가입
                  </Link>
                )}
              </li>
              <li>
                {isSignedIn ? (
                  <Link to="/me/account" className={linkClass}>
                    계정 설정
                  </Link>
                ) : (
                  <Link to="/find" className={linkClass}>
                    계정 찾기
                  </Link>
                )}
              </li>
            </ul>
          </nav>

          <nav aria-labelledby="footer-related-title">
            <h2 id="footer-related-title" className={headingClass}>
              관련 사이트
            </h2>
            <ul>
              <li>
                <a href={EXTERNAL_LINKS.CSE} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  부산대학교 정보컴퓨터공학부 <ArrowUpRight size={14} aria-hidden className="shrink-0 opacity-65" />
                  <span className="sr-only"> (새 탭)</span>
                </a>
              </li>
              <li>
                <a href={EXTERNAL_LINKS.SW_EDU} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  부산대학교 AI융합교육원 <ArrowUpRight size={14} aria-hidden className="shrink-0 opacity-65" />
                  <span className="sr-only"> (새 탭)</span>
                </a>
              </li>
            </ul>
          </nav>

          <section className="col-span-full sm:col-span-1" aria-labelledby="footer-feedback-title">
            <h2 id="footer-feedback-title" className={headingClass}>
              함께 만드는 OPUS
            </h2>
            <p className={descriptionClass}>
              불편했던 점이나 필요한 기능을 들려주세요. 여러분의 의견으로 더 나아집니다.
            </p>
            <a
              className="mt-5 inline-flex min-h-11 items-center gap-2.5 rounded-md border border-(--footer-line) bg-(--footer-button) px-4 py-2.5 text-[13px] font-medium transition-[border-color] duration-150 ease-[ease] hover:border-(--footer-accent)"
              href={EXTERNAL_LINKS.FEEDBACK}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquareShare size={17} aria-hidden />
              의견 보내기
              <ArrowUpRight size={15} aria-hidden />
              <span className="sr-only"> (새 탭)</span>
            </a>
          </section>
        </div>

        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-(--footer-line) pt-3 text-(--footer-muted)">
          <small className="text-xs leading-[1.8]">© {new Date().getFullYear()} PNUops. All rights reserved.</small>
          <button
            type="button"
            className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 py-2 text-xs leading-normal hover:text-(--footer-ink)"
            onClick={() => {
              const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
            }}
          >
            맨 위로 <ArrowUp size={15} aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
