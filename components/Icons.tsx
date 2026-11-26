// Icone disegnate a mano: stesso tratto (2px, estremità tonde) per tutta l'app.
import type { ReactNode } from 'react';

const svg = (children: ReactNode) =>
  function Icon({ size = 22 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    );
  };

export const Drop = svg(<path d="M12 3s6 6.2 6 10.5A6 6 0 0 1 6 13.5C6 9.2 12 3 12 3z" />);
export const Dumbbell = svg(<path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12" />);
export const Check = svg(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const X = svg(<path d="M6 6l12 12M18 6L6 18" />);
export const Plus = svg(<path d="M12 5v14M5 12h14" />);
export const Minus = svg(<path d="M5 12h14" />);
export const Search = svg(<><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2" /></>);
export const Sun = svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>);
export const Moon = svg(<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />);
export const ChevL = svg(<path d="M15 6l-6 6 6 6" />);
export const ChevR = svg(<path d="M9 6l6 6-6 6" />);
export const Logout = svg(<path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />);
export const History = svg(<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>);
export const Alert = svg(<path d="M12 4l9 16H3L12 4zM12 10v4M12 17.5v.01" />);
export const Lock = svg(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
export const Camera = svg(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>);
export const User = svg(<><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></>);
export const List = svg(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />);
export const Download = svg(<path d="M12 4v11M7 11l5 5 5-5M5 20h14" />);
