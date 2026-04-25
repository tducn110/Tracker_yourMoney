import { z } from 'zod';

/**
 * 💰 FINANCIAL PRECISION RULE (Antigravity V1.2)
 * All monetary values MUST be handled as strings to prevent float-point errors.
 * Use decimal.js for arithmetic operations.
 */
export const CurrencySchema = z.string().refine((val) => !isNaN(Number(val)), {
  message: "Invalid currency format. Must be a numeric string.",
});

// --- CORE ENTITIES ---

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  monthly_budget: CurrencySchema.default("0"),
  emergency_buffer: CurrencySchema.default("0"),
  income_date: z.number().min(1).max(31).default(1), // Day of month
  created_at: z.date().default(() => new Date()),
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  icon: z.string().optional(), // Emoji or Icon name
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#6366F1"),
  type: z.enum(["income", "expense"]),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: CurrencySchema,
  date: z.date().default(() => new Date()),
  category_id: z.string().uuid(),
  description: z.string().max(255).optional(),
  status: z.enum(["pending", "completed"]).default("completed"),
  type: z.enum(["income", "expense"]),
  metadata: z.record(z.string(), z.any()).optional(), // Extended transaction metadata
});

export const GoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  target_amount: CurrencySchema,
  current_amount: CurrencySchema.default("0"),
  deadline: z.date().optional(),
  is_completed: z.boolean().default(false),
});

export const BillSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1),
  amount: CurrencySchema,
  due_date: z.number().min(1).max(31), 
  category_id: z.string().uuid(),
  is_automated: z.boolean().default(false),
});

// --- TYPES ---
export type User = z.infer<typeof UserSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type Bill = z.infer<typeof BillSchema>;
