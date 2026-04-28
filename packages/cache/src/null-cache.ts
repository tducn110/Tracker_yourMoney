import type { ICache } from "./interface";

export class NullCache implements ICache {
  async get<T = unknown>(_key: string): Promise<T | null> {
    return null;
  }

  async set(_key: string, _value: unknown, _ttlSeconds?: number): Promise<void> {
    // Không làm gì cả
    return Promise.resolve();
  }

  async delete(_key: string): Promise<void> {
    // Không làm gì cả
    return Promise.resolve();
  }
}
