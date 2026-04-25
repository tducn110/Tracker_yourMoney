import { db } from "../index";

export type DB = typeof db;

/**
 * Base Repository class to support Dependency Injection and Transactions.
 * Highly robust pattern for Finance Tracker to ensure data integrity.
 */
export abstract class BaseRepository {
  /**
   * @param dbInstance The Drizzle database instance or transaction client.
   * Defaults to the global proxy instance if none provided.
   */
  constructor(protected readonly dbInstance: DB = db) {}

  /**
   * Returns the database instance to use for queries.
   * Internal methods should always use this.db instead of the global db.
   */
  protected get db() {
    return this.dbInstance;
  }
}
