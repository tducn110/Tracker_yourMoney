// apps/api/src/lib/crypto-utils.ts
import { logError } from "./logger";
// Standard Web Crypto API (Edge-compatible PBKDF2)
// This replaces bcryptjs which is incompatible with Cloudflare Workers.

/* 
 * Staff Grade: ESM-Clean WebCrypto API
 * Using globalThis.crypto which is standard in Node.js 19+ and browser environments.
 */
const webCrypto = globalThis.crypto;

const ITERATIONS = 100000;
const HASH_ALG = "SHA-256";

/**
 * Hash a password using PBKDF2
 * Output format: "salt:hash" (both hex encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Generate random salt
  const salt = webCrypto.getRandomValues(new Uint8Array(16));
  
  // Create key material
  const keyMaterial = await webCrypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive salted hash
  const derivedKey = await webCrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALG,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  
  const exportedKey = await webCrypto.subtle.exportKey("raw", derivedKey);
  const hashArray = Array.from(new Uint8Array(exportedKey));
  const saltArray = Array.from(salt);
  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) return false;
    
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const originalHash = hashHex;
    
    const keyMaterial = await webCrypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const derivedKey = await webCrypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: ITERATIONS,
        hash: HASH_ALG,
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
    const exportedKey = await webCrypto.subtle.exportKey("raw", derivedKey);
    const hashArray = Array.from(new Uint8Array(exportedKey));
    const currentHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    // Constant-time comparison
    return currentHash === originalHash;
  } catch (e) {
    logError(e, "crypto", "verifyHmac", "unknown");
    return false;
  }
}
