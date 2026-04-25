// apps/api/src/services/idempotency.ts
// L1 Cache Adapter for Idempotency — Throttles duplicate requests using In-Memory Map
// Can be easily swapped with Redis/Upstash KV in production.

const MEMORY_KV = new Map<string, { expiresAt: number }>();

export const IdempotencyStorageAdapter = {
  async get(key: string): Promise<boolean> {
    const record = MEMORY_KV.get(key);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      MEMORY_KV.delete(key);
      return false;
    }
    return true;
  },

  async set(key: string, ttlSeconds: number = 300): Promise<void> {
    MEMORY_KV.set(key, { expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  // Cleanup job meant to be run periodically
  cleanUpStaleKeys() {
    const now = Date.now();
    for (const [key, val] of MEMORY_KV.entries()) {
      if (now > val.expiresAt) {
        MEMORY_KV.delete(key);
      }
    }
  }
};
