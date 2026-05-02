export type { ICache } from './interface';
export { NullCache } from './null-cache';
export { MemoryCache } from './memory-cache';

// Factory function — returns MemoryCache by default (Phase 21)
import type { ICache } from './interface';
import { MemoryCache } from './memory-cache';
let defaultCacheInstance: MemoryCache | null = null;

export function getCache(): ICache {
  if (!defaultCacheInstance) {
    defaultCacheInstance = new MemoryCache({
      maxEntries: 2000,
      defaultTTLSeconds: 300, // 5 min
    });
  }
  return defaultCacheInstance;
}
