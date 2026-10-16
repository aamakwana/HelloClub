import Image from 'next/image';

const TINT = { Café: 'bg-[#FFE6CF]', Restaurant: 'bg-[#FCE9D8]', Pub: 'bg-[#F6DCC4]' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso) {
  const [year, month, day] = String(iso || '').split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

function TypeIcon({ type }) {
  const common = {
    width: 52,
    height: 52,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#C2410C',
    strokeWidth: 1.4,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (type === 'Café') {
    return (
      <svg {...common}>
        <path d="M3 8h14v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6V8z" />
        <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" />
        <path d="M7 2.5v3M11 2.5v3" />
      </svg>
    );
  }
  if (type === 'Pub') {
    return (
      <svg {...common}>
        <path d="M5 7h10v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />
        <path d="M15 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
        <path d="M5 7c0-2 1.5-3.5 3.5-3.5 1 0 1.5.5 1.5.5s.7-1 2.3-1C14 3 15 4.5 15 7" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" />
      <path d="M17 21V3c-2.2 1.2-3.5 4-3.5 7.5V13H17" />
    </svg>
  );
}

export default function DiscoverVenueCard({ venue, planHref }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <div
        role="img"
        aria-label="Illustration placeholder, no venue photo"
        className={`relative flex h-[132px] items-center justify-center ${TINT[venue.type] ?? 'bg-[#FCE9D8]'}`}
      >
        <TypeIcon type={venue.type} />
        <span className="absolute bottom-2.5 left-3 rounded-lg bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[#6B2B0D]">
          Illustration · no photo
        </span>
        <span className="absolute right-3 top-3 rounded-lg bg-[#32251F] px-2.5 py-1 text-xs font-bold text-[#FFF8EF]">
          {venue.type}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-[18px] pb-5">
        <div>
          <h2 className="text-[21px] font-bold leading-tight text-[#32251F]">{venue.name}</h2>
          <p className="text-sm text-[#6B5348]">{venue.area}</p>
        </div>
        <p className="text-[15px] text-[#32251F]">{venue.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {venue.tags.map(tag => (
            <span key={tag} className="rounded-xl bg-[#FFF1E4] px-3 py-1 text-[13px] font-bold text-[#9A3412]">
              {tag}
            </span>
          ))}
        </div>
        {venue.openingHours ? (
          <div className="rounded-xl bg-[#FFF8EF] px-3 py-2 text-[13px] text-[#32251F]">
            <span className="font-bold">Opening hours in the article</span>
            <span className="block text-[#6B5348]">{venue.openingHours}</span>
          </div>
        ) : null}
        <div className="mt-auto flex flex-col gap-3 border-t border-[#E8D9C8] pt-3">
          <div className="flex items-center gap-2.5">
            <Image src="/adressa-a.png" alt="Adresseavisen" width={23} height={26} className="h-[26px] w-auto shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#32251F]">Omtalt i Adresseavisen</p>
              <p className="text-[13px] text-[#6B5348]">
                {venue.source.kind} · {formatDate(venue.source.publishedAt)}
              </p>
            </div>
            <a
              href={venue.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold text-[#C2410C]"
            >
              Read article
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
          {planHref ? (
            <a
              href={planHref}
              className="flex h-[50px] items-center justify-center rounded-2xl bg-[#C2410C] text-base font-bold text-white"
            >
              + Create a plan here
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
