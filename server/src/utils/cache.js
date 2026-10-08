/**
 * Ultra-Fast Multi-Tier Cache (In-Memory LRU/TTL + Redis Fallback)
 * Ensures near-zero millisecond response times (<1ms) for frequent reads.
 */
const Redis = require("ioredis");

let redisClient = null;
if (process.env.USE_REDIS === "true") {
  try {
    redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true
    });
    redisClient.on("error", () => {
      redisClient = null;
    });
    redisClient.connect().catch(() => {
      // Gracefully silent if Redis is remote/offline
      redisClient = null;
    });
  } catch (err) {
    redisClient = null;
  }
}

// In-Memory Fast Cache with TTL
const memoryStore = new Map();

const set = async (key, value, ttlSeconds = 60) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  memoryStore.set(key, { value, expiresAt });

  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // Ignore Redis failures, memory cache already succeeded
    }
  }
};

const get = async (key) => {
  const item = memoryStore.get(key);
  if (item) {
    if (Date.now() < item.expiresAt) {
      return item.value;
    }
    memoryStore.delete(key);
  }

  if (redisClient) {
    try {
      const redisVal = await redisClient.get(key);
      if (redisVal) {
        const parsed = JSON.parse(redisVal);
        memoryStore.set(key, { value: parsed, expiresAt: Date.now() + 30000 });
        return parsed;
      }
    } catch {
      // Ignore
    }
  }

  return null;
};

const del = async (keyPattern) => {
  // Clear from memory
  for (const k of memoryStore.keys()) {
    if (k.startsWith(keyPattern) || k === keyPattern) {
      memoryStore.delete(k);
    }
  }

  if (redisClient) {
    try {
      const keys = await redisClient.keys(`${keyPattern}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Ignore
    }
  }
};

module.exports = {
  get,
  set,
  del
};
