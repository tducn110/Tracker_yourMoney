// packages/shared-schemas/src/goal.schema.ts
import { z } from "zod";

const decimalString = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const n = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(n) || n < 0) throw new Error("Số tiền không được âm");
    return n.toFixed(2);
  });

const positiveDecimal = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const n = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(n) || n <= 0) throw new Error("Số tiền phải là số dương");
    return n.toFixed(2);
  });

// ── Insert ─────────────────────────────────────────────────────────
export const insertGoalSchema = z.object({
  name:                z.string().min(1).max(100).trim(),
  icon:                z.string().max(20).default("🎯"),
  targetAmount:        positiveDecimal,
  monthlyContribution: decimalString.default("0.00"),
  deadline:            z.coerce.date().transform((d) =>
    d.toISOString().split("T")[0], // "YYYY-MM-DD"
  ).optional(),
  priority:            z.number().int().min(1).max(3).default(1),
  notes:               z.string().max(65535).optional(),
});

// ── Update ─────────────────────────────────────────────────────────
export const updateGoalSchema = insertGoalSchema.partial().extend({
  status: z.enum(["active", "paused", "cancelled"]).optional(),
  currentSaved: decimalString.optional(),
});

// ── Contribute (add savings to a goal) ───────────────────────────
export const contributeGoalSchema = z.object({
  amount: positiveDecimal,
  note:   z.string().max(255).optional(),
});

// ── Response ────────────────────────────────────────────────────────
export const goalResponseSchema = z.object({
  id:                  z.string(),
  userId:              z.string(),
  name:                z.string(),
  icon:                z.string(),
  targetAmount:        z.string(),
  currentSaved:        z.string(),
  monthlyContribution: z.string(),
  deadline:            z.string().nullable(),
  status:              z.enum(["active", "completed", "paused", "cancelled"]),
  priority:            z.number(),
  notes:               z.string().nullable(),
  completedAt:         z.coerce.date().nullable(),
  createdAt:           z.coerce.date(),
});

export type InsertGoal     = z.infer<typeof insertGoalSchema>;
export type UpdateGoal     = z.infer<typeof updateGoalSchema>;
export type ContributeGoal = z.infer<typeof contributeGoalSchema>;
export type GoalResponse   = z.infer<typeof goalResponseSchema>;
