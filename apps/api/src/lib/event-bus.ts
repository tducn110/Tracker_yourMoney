/**
 * EventBus — In-process event emitter for async background tasks (Phase 26)
 *
 * Decouples heavy side-effects from the request/response cycle:
 * - Budget recalculation after transaction CRUD
 * - Analytics cache invalidation
 * - Audit logging (fire-and-forget)
 * - Notification creation
 *
 * When Redis is available, swap to BullMQ for distributed event processing.
 */

import { EventEmitter } from 'events';
import { logger } from './logger';

// ── Event Types ─────────────────────────────────────────────────────────
export interface TransactionCreatedEvent {
  type: 'transaction:created';
  transactionId: string;
  userId: string;
  amount: string;
  categoryId: number;
  walletId: string;
}

export interface TransactionUpdatedEvent {
  type: 'transaction:updated';
  transactionId: string;
  userId: string;
}

export interface TransactionDeletedEvent {
  type: 'transaction:deleted';
  transactionId: string;
  userId: string;
}

export interface BudgetInvalidatedEvent {
  type: 'budget:invalidated';
  userId: string;
  budgetId?: string;
}

export interface BillPaidEvent {
  type: 'bill:paid';
  billId: string;
  userId: string;
  amount: string;
}

export interface GoalContributedEvent {
  type: 'goal:contributed';
  goalId: string;
  userId: string;
  amount: string;
}

export type AppEvent =
  | TransactionCreatedEvent
  | TransactionUpdatedEvent
  | TransactionDeletedEvent
  | BudgetInvalidatedEvent
  | BillPaidEvent
  | GoalContributedEvent;

// ── Event Bus ───────────────────────────────────────────────────────────
class EventBus {
  private emitter = new EventEmitter();
  // Increase max listeners from default 10 to avoid warnings
  private maxListeners = 50;

  constructor() {
    this.emitter.setMaxListeners(this.maxListeners);
  }

  /** Emit an event (fire-and-forget, non-blocking) */
  emit(event: AppEvent): void {
    // Use setImmediate to defer handler execution off the critical path
    setImmediate(() => {
      this.emitter.emit(event.type, event);
    });
  }

  /** Emit synchronously (blocking — use only when result is needed) */
  emitSync(event: AppEvent): void {
    this.emitter.emit(event.type, event);
  }

  /** Subscribe to an event type */
  on<T extends AppEvent>(eventType: T['type'], handler: (event: T) => void | Promise<void>): void {
    this.emitter.on(eventType, (event: AppEvent) => {
      Promise.resolve(handler(event as T)).catch((err) => {
        logger.error({ event: 'EVENT_BUS_HANDLER_ERROR', eventType, err }, `Unhandled error in handler for "${eventType}"`);
      });
    });
  }

  /** Subscribe once */
  once<T extends AppEvent>(eventType: T['type'], handler: (event: T) => void | Promise<void>): void {
    this.emitter.once(eventType, (event: AppEvent) => {
      Promise.resolve(handler(event as T)).catch((err) => {
        logger.error({ event: 'EVENT_BUS_HANDLER_ERROR', eventType, err }, `Unhandled error in once-handler for "${eventType}"`);
      });
    });
  }

  /** Remove a specific handler */
  off<T extends AppEvent>(eventType: T['type'], handler: (event: T) => void | Promise<void>): void {
    this.emitter.off(eventType, handler as (...args: any[]) => void);
  }

  /** Remove all handlers for an event type */
  removeAllListeners(eventType?: AppEvent['type']): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

// Singleton
export const eventBus = new EventBus();
