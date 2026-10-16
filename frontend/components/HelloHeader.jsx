export default function HelloHeader({ current }) {
  return (
    <header className="hello-header">
      <a
        href="/requests"
        className="hello-header-requests"
        aria-current={current === '/requests' ? 'page' : undefined}
      >
        Requests
      </a>
    </header>
  );
}
