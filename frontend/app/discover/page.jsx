'use client';

import { useMemo, useState } from 'react';
import DiscoverVenueCard from '../../components/DiscoverVenueCard';
import HelloShell from '../../components/HelloShell';
import { PLACE_FILTERS, filterPlaces, listPlaces } from '../../lib/places';

const PLAN_MODE = 'link';

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const results = useMemo(
    () => filterPlaces(listPlaces(), { query, filter }),
    [query, filter],
  );

  return (
    <HelloShell current="/discover">
      <main className="hello-discover mx-auto min-h-screen max-w-lg px-5 py-10">
        <p className="hello-club-mark">Hello Club</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#32251F]">Places to meet</h1>
        <p className="mt-3 text-[#6B5348]">Find a place. Make a plan.</p>

        <label className="relative mt-6 block">
          <span className="sr-only">Search venues</span>
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by name, area or food"
            className="h-[50px] w-full rounded-full border border-[#E8D9C8] bg-white pl-12 pr-4 text-base text-[#32251F]"
          />
          <svg className="absolute left-4 top-[15px]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B5549" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
        </label>

        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Place type">
          {PLACE_FILTERS.map(item => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={filter === item.id}
              className="hello-chip"
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-[#6B5348]">
          {results.length} {results.length === 1 ? 'place' : 'places'} from Adresseavisen's Restaurantguiden
        </p>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-[18px]">
            {results.map(venue => (
              <DiscoverVenueCard
                key={venue.id}
                venue={venue}
                planHref={PLAN_MODE === 'link' ? `/create?placeId=${encodeURIComponent(venue.id)}` : null}
              />
            ))}
          </div>
        ) : (
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#32251F]">No places match that search</h2>
            <p className="mt-3 text-[#6B5348]">Try another word or category.</p>
            <button
              type="button"
              className="hello-pass mt-4"
              onClick={() => { setQuery(''); setFilter('all'); }}
            >
              Clear search
            </button>
          </section>
        )}

        <p className="mt-8 text-center text-[13px] text-[#6B5348]">
          Descriptions summarise Adresseavisen's Restaurantguiden. Hello Club links to the articles as sources;
          check details with the venue before you go.
        </p>
      </main>
    </HelloShell>
  );
}
