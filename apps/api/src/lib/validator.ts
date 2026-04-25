// apps/api/src/lib/validator.ts
import { zValidator as honoZValidator } from "@hono/zod-validator";
import { err } from "./response";
import type { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";

/**
 * A wrapper around hono/zod-validator that provides a consistent
 * error response format (HTTP 400) for all validation failures.
 */
export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets
>(
  target: Target,
  schema: T
) => {
  return honoZValidator(target, schema, (result, c) => {
    if (!result.success) {
      return err(
        c, 
        400, 
        "VALIDATION_ERROR", 
        "Dữ liệu gửi lên không hợp lệ.", 
        result.error.issues
      );
    }
  });
};
