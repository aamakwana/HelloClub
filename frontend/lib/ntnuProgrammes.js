import catalogue from '../data/ntnu-programmes.json' with { type: 'json' };

export const NTNU_PROGRAMME_SOURCE = catalogue.source;
export const NTNU_PROGRAMMES = catalogue.programmes;

export function matchingProgrammes(query, limit = 12) {
  const needle = query.trim().toLocaleLowerCase('nb-NO');
  if (!needle) return NTNU_PROGRAMMES.slice(0, limit);
  const starts = [];
  const contains = [];
  for (const name of NTNU_PROGRAMMES) {
    const haystack = name.toLocaleLowerCase('nb-NO');
    if (haystack.startsWith(needle)) starts.push(name);
    else if (haystack.includes(needle)) contains.push(name);
  }
  return starts.concat(contains).slice(0, limit);
}
