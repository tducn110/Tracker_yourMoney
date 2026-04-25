/**
 * Giao diện hợp đồng (Contract) cho tầng Cache.
 * Trong MVP, chúng ta chỉ dùng NullCache.
 * Khi scale lên Redis, chỉ cần tạo `RedisCache implements ICache`.
 */
export interface ICache {
  /**
   * Lấy giá trị từ cache.
   */
  get<T = unknown>(key: string): Promise<T | null>;

  /**
   * Ghi giá trị vào cache với TTL tùy chọn.
   */
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

  /**
   * Xóa một key.
   */
  delete(key: string): Promise<void>;
}
