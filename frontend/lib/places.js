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

export async function resolvePlaceName(placeId) {
  if (!placeId) return null;
  const urls = ['/places.json', '/data/places.json'];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const place = asList(await response.json()).find(item => matchesId(item, placeId));
      const label = placeLabel(place).trim();
      if (label) return label;
    } catch {
      // Venue data lives with the discover page; skip if it is not here yet.
    }
  }
  return null;
}
