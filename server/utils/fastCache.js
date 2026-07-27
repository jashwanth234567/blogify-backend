/**
 * In-memory LRU-style cache for sub-second database query responses.
 */

const cacheStore = new Map();
const DEFAULT_TTL_MS = 15000; // 15 seconds fast cache

export const getCachedData = (key) => {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return item.value;
};

export const setCachedData = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

export const clearCache = (prefix = "") => {
  if (!prefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};
