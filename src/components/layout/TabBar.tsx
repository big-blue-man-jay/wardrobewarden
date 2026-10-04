import { NavLink } from 'react-router';
import { CalendarIcon, ChartIcon, HangerIcon, LayersIcon, SunIcon } from '../ui/icons';

const TABS = [
  { to: '/closet', label: 'Closet', icon: HangerIcon },
  { to: '/looks', label: 'Looks', icon: LayersIcon },
  null, // Today (center)
  { to: '/journal', label: 'Journal', icon: CalendarIcon },
  { to: '/insights', label: 'Insights', icon: ChartIcon },
] as const;

export function TabBar() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center">
        {TABS.map((tab) =>
          tab === null ? (
            <li key="today" className="flex justify-center">
              <NavLink
                to="/today"
                aria-label="Today"
                className={({ isActive }) =>
                  `tap -mt-5 flex h-14 w-14 flex-col items-center justify-center rounded-full shadow-lg shadow-ink/20 ${
                    isActive ? 'bg-accent text-paper' : 'bg-ink text-paper'
                  }`
                }
              >
                <SunIcon size={24} />
                <span className="text-[9px] leading-none font-medium tracking-wide uppercase">Today</span>
              </NavLink>
            </li>
          ) : (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  `tap flex flex-col items-center gap-0.5 py-1 text-[11px] ${isActive ? 'text-accent' : 'text-muted'}`
                }
              >
                <tab.icon size={24} />
                {tab.label}
              </NavLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
