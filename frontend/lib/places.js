import venues from '../data/places.json';

export const PLACE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Café', label: 'Cafés' },
  { id: 'Restaurant', label: 'Restaurants' },
  { id: 'Pub', label: 'Pubs' },
  { id: 'student', label: 'Student price' },
];

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  if (data && typeof data === 'object') return Object.values(data);
  return [];
}

function placeLabel(place) {
  return place?.name || place?.title || place?.place || place?.label || '';
}

function matchesId(place, placeId) {
  const candidates = [place?.id, place?.placeId, place?.place_id, place?.slug];
  return candidates.some(value => value != null && String(value) === String(placeId));
}

export function listPlaces() {
  return asList(venues);
}

export function filterPlaces(places, { query, filter } = {}) {
  const q = (query || '').trim().toLowerCase();
  return asList(places).filter(venue => {
    if (filter === 'student' && !venue.studentPrice) return false;
    if (filter && filter !== 'all' && filter !== 'student' && venue.type !== filter) return false;
    if (!q) return true;
    return [venue.name, venue.area, venue.description, venue.type, ...(venue.tags || [])]
      .join(' ')
      .toLowerCase()
      .includes(q);
  });
}

export function findPlaceName(placeId) {
  if (!placeId) return null;
  const place = asList(venues).find(item => matchesId(item, placeId));
  const label = placeLabel(place).trim();
  return label || null;
}

export async function resolvePlaceName(placeId) {
  return findPlaceName(placeId);
}
