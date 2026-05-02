/**
 * MemoryCache — In-memory LRU cache with TTL support (Phase 21)
 *
 * Drop-in replacement for NullCache. Provides real in-memory caching
 * until Redis is available. Thread-safe via single-threaded JS event loop.
 *
 * Eviction strategy: TTL-based expiry + LRU when capacity exceeded.
 */

import type { ICache } from './interface';

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number; // epoch ms, 0 = no expiry
}

export class MemoryCache implements ICache {
  private store = new Map<string, CacheEntry>();
  private accessOrder: string[] = []; // LRU tracking (most recent at end)
  private maxEntries: number;
  private defaultTTLSeconds: number;

  constructor(options?: { maxEntries?: number; defaultTTLSeconds?: number }) {
    this.maxEntries = options?.maxEntries ?? 1000;
    this.defaultTTLSeconds = options?.defaultTTLSeconds ?? 300; // 5 min default
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check TTL
    if (entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
      this.evict(key);
      return null;
    }

    // Move to end of LRU list
    this.touch(key);
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTTLSeconds;
    const expiresAt = ttl > 0 ? Date.now() + ttl * 1000 : 0;

    // Update existing entry
    if (this.store.has(key)) {
      this.store.set(key, { value, expiresAt });
      this.touch(key);
      return;
    }

    // Evict oldest if at capacity
    if (this.store.size >= this.maxEntries) {
      const oldest = this.accessOrder.shift();
      if (oldest) this.store.delete(oldest);
    }

    this.store.set(key, { value, expiresAt });
    this.accessOrder.push(key);
  }

  async delete(key: string): Promise<void> {
    this.evict(key);
  }

  /** Remove expired entries (call periodically or on get) */
  async prune(): Promise<number> {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store) {
      if (entry.expiresAt > 0 && now > entry.expiresAt) {
        this.evict(key);
        pruned++;
      }
    }
    return pruned;
  }

  /** Current number of entries */
  get size(): number {
    return this.store.size;
  }

  private touch(key: string): void {
    const idx = this.accessOrder.indexOf(key);
    if (idx !== -1) {
      this.accessOrder.splice(idx, 1);
    }
    this.accessOrder.push(key);
  }

  private evict(key: string): void {
    this.store.delete(key);
    const idx = this.accessOrder.indexOf(key);
    if (idx !== -1) this.accessOrder.splice(idx, 1);
  }
}
