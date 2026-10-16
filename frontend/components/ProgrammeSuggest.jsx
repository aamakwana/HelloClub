'use client';

import { useId, useMemo, useRef, useState } from 'react';
import { matchingProgrammes, NTNU_PROGRAMME_SOURCE } from '../lib/ntnuProgrammes';

export default function ProgrammeSuggest({ value, onChange }) {
  const listId = useId();
  const inputId = useId();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => matchingProgrammes(value), [value]);

  function commit(name) {
    onChange(name);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive(i => Math.min(i + 1, Math.max(matches.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(i => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter' && open && matches[active]) {
      event.preventDefault();
      commit(matches[active]);
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-[#32251F]" htmlFor={inputId}>
        Study programme
        <input
          id={inputId}
          ref={inputRef}
          required
          maxLength={120}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          value={value}
          placeholder="Start typing a programme name"
          onChange={e => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => { setTimeout(() => setOpen(false), 120); }}
          onKeyDown={onKeyDown}
          className="mt-2 w-full rounded-xl border border-[#E8D9C8] bg-[#FFF8EF] p-3 text-[#32251F]"
        />
      </label>
      {open && matches.length ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="NTNU programme suggestions"
          className="hello-suggest absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#E8D9C8] bg-white py-1 shadow-sm"
        >
          {matches.map((name, index) => (
            <li
              key={name}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={`cursor-pointer px-3 py-2 text-sm text-[#32251F] ${index === active ? 'bg-[#FFF8EF]' : ''}`}
              onMouseDown={event => {
                event.preventDefault();
                commit(name);
              }}
              onMouseEnter={() => setActive(index)}
            >
              {name}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-sm font-normal text-[#6B5348]">
        Suggestions are NTNU programme names from{' '}
        <a className="font-semibold text-[#C2410C]" href={NTNU_PROGRAMME_SOURCE.cataloguePage}>
          ntnu.no/studier/alle
        </a>
        , retrieved {NTNU_PROGRAMME_SOURCE.retrievedAt}. You can pick a match or keep your own text.
      </p>
    </div>
  );
}
