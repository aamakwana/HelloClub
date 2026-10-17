const ITEMS = [
  { href: '/create', label: 'Create', icon: CreateIcon },
  { href: '/for-you', label: 'For You', icon: CardsIcon },
  { href: '/discover', label: 'Discover', icon: CompassIcon },
  { href: '/profile', label: 'Profile', icon: PersonIcon },
];

function CreateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
      <path d="M12 8v8M8 12h8" fill="none" stroke="#FFF8EF" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="7" y="3.5" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="9.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" fill="#FFF8EF" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14.7 9.3 13.1 13.1 9.3 14.7 10.9 10.9 14.7 9.3z" fill="currentColor" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 19.25c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function HelloNav({ current }) {
  return (
    <nav className="hello-nav" aria-label="Hello Club">
      {ITEMS.map(item => {
        const Icon = item.icon;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={current === item.href ? 'page' : undefined}
          >
            <Icon />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
