/**
 * normalizeItem — Shared utility to map raw API responses for
 * Properties, Products, and Services into a consistent UI schema.
 *
 * API field reference:
 *  Property: name, roomType, amenities, description, price, images, isVacant, address, agentId
 *  Product:  name, businessCategory, description, price, delivery, images, isAvailable
 *  Service:  name, serviceCategory, availableDays, description, price, perUnit, time, images, isAvailable
 */

/**
 * @param {object} item   Raw item from the API
 * @param {'lodge'|'product'|'service'} kind  The internal kind identifier
 * @returns {object}  Normalized item safe to pass to ListingCard / Detail
 */
export function normalizeItem(item, kind) {
  const id = item.id || item._id || '';

  // ── Category label (used for filtering in Explore) ──────────────────
  // CATEGORIES in data.js uses 'Lodge', 'Vendor', 'Service'
  const CAT_MAP = { lodge: 'Lodge', product: 'Vendor', service: 'Service' };
  const cat = CAT_MAP[kind] || 'Vendor';

  // ── Sub-type label (shown as subtitle on cards and used for sub-filters) ──
  // Maps to the correct field per item type
  let type;
  if (kind === 'lodge')   type = item.roomType || item.type || 'Lodge';
  if (kind === 'product') type = item.businessCategory || item.type || 'Vendor';
  if (kind === 'service') type = item.serviceCategory || item.type || 'Service';

  // ── Availability badge ───────────────────────────────────────────────
  let badge = item.badge;
  if (!badge) {
    if (kind === 'lodge')   badge = item.isVacant === false ? 'Taken' : 'Available';
    else                    badge = item.isAvailable === false ? 'Closed' : 'Open';
  }

  // ── Price & unit ─────────────────────────────────────────────────────
  const price = item.price || 0;
  const unit  = item.unit || (kind === 'lodge' ? '/year' : '');

  // ── Label for placeholder image ──────────────────────────────────────
  const LABEL_MAP = { lodge: 'lodge — exterior', product: 'food — meals', service: 'service — print shop' };
  const label = item.label || LABEL_MAP[kind] || '';

  // ── Ratings & Reviews ────────────────────────────────────────────────
  const ratings = item.ratings || [];
  const totalReviews = ratings.length > 0 ? ratings.length : (item.totalReviews || 0);
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : (item.averageRating !== undefined ? item.averageRating : (item.rating || 0));

  return {
    // Core identity
    id,
    kind,
    cat,
    // Display fields
    name:   item.name || item.title || 'Unknown Listing',
    type,
    badge,
    label,
    // Pricing
    price,
    unit,
    // Meta
    rating: averageRating,
    totalReviews: totalReviews,
    dist:   item.dist || '0.5 km',
    // Spread the original item last so any extra fields (amenities,
    // delivery, availableDays, images, agentId, perUnit, time etc.) pass through
    ...item,
    // Re-apply our computed fields AFTER the spread so they win
    id, kind, cat, type, badge, label, price, unit,
  };
}
