const ITEMS = [
  { href: '/create', label: 'Create' },
  { href: '/for-you', label: 'For You' },
  { href: '/discover', label: 'Discover' },
  { href: '/profile', label: 'Profile' },
];

export default function HelloNav({ current }) {
  return (
    <nav className="hello-nav" aria-label="Hello Club">
      {ITEMS.map(item => (
        <a
          key={item.href}
          href={item.href}
          aria-current={current === item.href ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
