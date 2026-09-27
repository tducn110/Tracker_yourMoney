// apps/api/src/lib/jwt.ts
// JWT helpers using jose (Web Crypto API — Edge Runtime compatible)
// KHÔNG dùng jsonwebtoken (Node.js only)
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const getSecret = () => {
  const secret = (globalThis as any).JWT_SECRET || (typeof process !== "undefined" ? process.env.JWT_SECRET : undefined) || "finance_tracker_default_secret_for_dev";
  return new TextEncoder().encode(secret);
};

export interface TokenPayload extends JWTPayload {
  userId: number;
  email: string;
}

// Access token — 15 phút
export async function signAccessToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecret());
}

// Refresh token — 30 ngày
export async function signRefreshToken(payload: Omit<TokenPayload, "iat" | "exp">) {
  // jti (JWT ID) ensures each token is unique even if issued within the same second
  const jti = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(jti)
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as TokenPayload;
}
