// Machines + services catalogue, cached in memory (default 60 s) so the public
// website does not hit MySQL on every page view.
import { pool } from '../db/pool.js';
import { config } from '../config/index.js';

let cache = { data: null, expiresAt: 0, pending: null };

async function loadFromDb() {
  const [machines] = await pool.execute(
    'SELECT id, slug, name, short_name, category, specs, image, sort_order FROM machines ORDER BY sort_order, id',
  );
  const [services] = await pool.execute(
    'SELECT id, slug, title, description, image, sort_order FROM services ORDER BY sort_order, id',
  );
  return {
    machines: machines.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      shortName: m.short_name,
      category: m.category,
      specs: m.specs.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
      image: m.image,
      sortOrder: m.sort_order,
    })),
    services: services.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      description: s.description,
      image: s.image,
      sortOrder: s.sort_order,
    })),
  };
}

/** Returns { data, hit } - hit=true when served from memory. */
export async function getCatalogue(now = Date.now()) {
  if (cache.data && now < cache.expiresAt) return { data: cache.data, hit: true };
  // Concurrent misses share one DB round-trip instead of stampeding MySQL.
  cache.pending ??= loadFromDb()
    .then((data) => {
      cache = { data, expiresAt: Date.now() + config.catalogueCacheMs, pending: null };
      return data;
    })
    .finally(() => { cache.pending = null; });
  return { data: await cache.pending, hit: false };
}

export function clearCatalogueCache() {
  cache = { data: null, expiresAt: 0, pending: null };
}
