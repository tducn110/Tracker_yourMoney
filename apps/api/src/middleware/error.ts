// apps/api/src/middleware/error.ts
// Global error handler — no stack traces to client (security)
import { ErrorHandler } from "hono";
import { ZodError } from "zod";

export const errorHandler: ErrorHandler = (err, c) => {
  // Zod validation error → 400 with field details
  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: err.issues.map((e: any) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    }, 400);
  }

  // Generic error — log internally, return safe message
  console.error("[API Error]", {
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    },
  }, 500);
};
