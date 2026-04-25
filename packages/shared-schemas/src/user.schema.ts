// packages/shared-schemas/src/user.schema.ts
import { z } from "zod";

// ── Insert (signup) ──────────────────────────────────────────────
export const insertUserSchema = z.object({
  email:    z.string().email("Email không hợp lệ").max(255),
  password: z.string().min(8, "Tối thiểu 8 ký tự").max(100),
  fullName: z.string().min(1).max(100).trim(),
  username: z.string().min(3).max(50).regex(
    /^[a-z0-9_]+$/,
    "Chỉ dùng chữ thường, số, gạch dưới",
  ),
});

// ── Login ─────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── Social Login ──────────────────────────────────────────────────
export const socialLoginSchema = z.object({
  idToken: z.string().min(1, "ID Token không được để trống"),
});

// ── Update Profile ────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  fullName:   z.string().min(1).max(100).trim().optional(),
  avatarText: z.string().max(5).optional(),
});

// ── Response (public profile — KHÔNG có passwordHash) ────────────
// Zero-trust: passwordHash NEVER leaves the server
export const userResponseSchema = z.object({
  id:            z.string(), // bigint as string
  email:         z.string().email(),
  fullName:      z.string(),
  username:      z.string(),
  avatarUrl:     z.string().url().nullable(),
  avatarText:    z.string().nullable(),
  isActive:      z.number(),
  emailVerified: z.number(),
  createdAt:     z.coerce.date(),
});

// ── User Settings ─────────────────────────────────────────────────
export const updateUserSettingsSchema = z.object({
  monthlyBudget:        z.coerce.number().nonnegative().optional(),
  emergencyBuffer:      z.coerce.number().nonnegative().optional(),
  incomeDate:           z.number().int().min(1).max(31).optional(),
  currency:             z.string().max(10).default("VND").optional(),
  language:             z.enum(["vi", "en"]).default("vi").optional(),
  timezone:             z.string().max(50).optional(),
  theme:                z.enum(["light", "dark", "system"]).optional(),
  notifyBillBeforeDays: z.number().int().min(0).max(30).optional(),
  notifyBudgetThreshold:z.number().min(0).max(100).optional(),
  notifyEmail:          z.number().min(0).max(1).optional(),
  notifyPush:           z.number().min(0).max(1).optional(),
});

export type InsertUser        = z.infer<typeof insertUserSchema>;
export type LoginInput        = z.infer<typeof loginSchema>;
export type SocialLoginInput   = z.infer<typeof socialLoginSchema>;
export type UserResponse      = z.infer<typeof userResponseSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
