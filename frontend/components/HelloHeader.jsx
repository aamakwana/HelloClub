import { Dancing_Script } from 'next/font/google';

const script = Dancing_Script({ subsets: ['latin'], weight: ['700'] });

export default function HelloHeader({ current }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#F0E0CF] bg-[#FFF8EF]">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-5 py-3">
        <span className={`${script.className} min-w-0 shrink text-[26px] leading-none text-[#C2410C] sm:text-[32px]`}>
          Hello Club
        </span>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <span className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#F0DCC8] bg-white px-2.5 text-xs font-bold text-[#32251F] sm:gap-1.5 sm:px-3.5 sm:text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.2A7 7 0 0 0 5 9.8C5 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.8" r="2.2" />
            </svg>
            Trondheim
          </span>
          <a
            href="/requests"
            className="flex h-9 shrink-0 items-center rounded-full border border-[#C2410C] bg-white px-3 text-xs font-bold text-[#C2410C] no-underline sm:px-4 sm:text-sm aria-[current=page]:bg-[#C2410C] aria-[current=page]:text-[#FFF8EF]"
            aria-current={current === '/requests' ? 'page' : undefined}
          >
            Requests
          </a>
        </div>
      </div>
    </header>
  );
}
