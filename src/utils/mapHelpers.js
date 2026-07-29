// Default center (e.g., Unilag campus coordinates)
export const DEFAULT_MAP_CENTER = [6.5173, 3.3986];

/**
 * Extracts or generates a lat/lng for a given item to display on the map.
 * @param {object} item The normalized item
 * @param {number} index Index to help generate spread if mocking
 * @returns {[number, number]} [latitude, longitude]
 */
export function getItemCoordinates(item, index) {
  // If the backend provided a location object with latitude/longitude
  if (item.location) {
    const lat = item.location.lat !== undefined ? item.location.lat : item.location.latitude;
    const lng = item.location.lng !== undefined ? item.location.lng : item.location.longitude;
    if (lat !== undefined && lng !== undefined) {
      return [Number(lat), Number(lng)];
    }
  }

  // Fallback: Generate a pseudo-random cluster around the default center
  // so items without coordinates still show up distributed on the map.
  const latOffset = (Math.sin(index * 2.5) * 0.003);
  const lngOffset = (Math.cos(index * 2.5) * 0.003);
  
  return [
    DEFAULT_MAP_CENTER[0] + latOffset,
    DEFAULT_MAP_CENTER[1] + lngOffset
  ];
}
