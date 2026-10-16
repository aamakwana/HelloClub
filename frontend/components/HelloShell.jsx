import HelloNav from './HelloNav';

export default function HelloShell({ current, children, showNav = true }) {
  return (
    <div className="hello-app min-h-screen bg-[#FFF8EF] text-[#32251F]">
      <div className={showNav ? 'hello-app-main' : ''}>{children}</div>
      {showNav ? <HelloNav current={current} /> : null}
    </div>
  );
}
