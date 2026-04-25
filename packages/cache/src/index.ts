export type { ICache } from './interface';
export { NullCache } from './null-cache';

// Factory function mặc định cho MVP
import type { ICache } from './interface';
import { NullCache } from './null-cache';
let defaultCacheInstance: NullCache | null = null;

export function getCache(): ICache {
  if (!defaultCacheInstance) {
    defaultCacheInstance = new NullCache();
  }
  return defaultCacheInstance;
}
