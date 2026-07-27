// ── Haversine distance in km ──────────────────────────────────────────────────
export function calcDistance(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Calculate dynamic distance between item and its campus gate ───────────────
export function getDistanceToCampus(item, schools = []) {
  if (item.kind === 'product' || item.kind === 'service' || item.kind === 'business') {
    return item.campus || item.dist || 'Campus';
  }

  const propLat = item.location?.lat;
  const propLng = item.location?.lng;

  // Fallback if property has no coordinates
  if (propLat === undefined || propLng === undefined) {
    return item.dist;
  }

  const propCampus = item.campus;
  if (!propCampus) {
    return item.dist;
  }

  // Find the campus in the schools array
  let matchingCampus = null;
  for (const school of schools) {
    if (school.campus && Array.isArray(school.campus)) {
      const found = school.campus.find(c => c.name === propCampus);
      if (found) {
        matchingCampus = found;
        break;
      }
    }
  }

  if (!matchingCampus || !matchingCampus.location?.latitude || !matchingCampus.location?.longitude) {
    return item.dist;
  }

  const campLat = matchingCampus.location.latitude;
  const campLng = matchingCampus.location.longitude;

  const distance = calcDistance(propLat, propLng, campLat, campLng);

  // e.g. "1.2 km from Main Campus Gate"
  return `${distance.toFixed(1)} km from ${matchingCampus.name} Gate`;
}
