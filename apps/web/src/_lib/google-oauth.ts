/**
 * Custom Google OAuth flow — bypasses Firebase's signInWithRedirect which
 * relies on sessionStorage (cleared by Safari during cross-origin redirects).
 *
 * Flow:
 *   initiateGoogleOAuth() → redirect to accounts.google.com
 *   → Google authenticates → redirect back with #id_token=... fragment
 *   → consumeGoogleOAuthState() extracts id_token from fragment
 *   → signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
 *
 * State is stored in localStorage (survives Safari redirects), not sessionStorage.
 */

const OAUTH_STATE_KEY = "__google_oauth_state";
const OAUTH_NONCE_KEY = "__google_oauth_nonce";

/**
 * Redirect the browser to Google OAuth. Stores CSRF state + nonce in
 * localStorage so we can verify the response when Google redirects back.
 */
export function initiateGoogleOAuth(): void {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  localStorage.setItem(OAUTH_STATE_KEY, state);
  localStorage.setItem(OAUTH_NONCE_KEY, nonce);

  const redirectUri =
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    nonce,
    state,
    prompt: "select_account",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * On page load, check the URL fragment for a Google OAuth id_token.
 * Returns { idToken } if a valid OAuth response is found, null otherwise.
 * Cleans the fragment from the URL and removes stored state.
 */
export function consumeGoogleOAuthState(): { idToken: string } | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.slice(1));
  const idToken = params.get("id_token");
  const state = params.get("state");

  if (!idToken || !state) {
    // Could be a Firebase redirect fragment — don't touch it
    return null;
  }

  const savedState = localStorage.getItem(OAUTH_STATE_KEY);
  localStorage.removeItem(OAUTH_STATE_KEY);
  localStorage.removeItem(OAUTH_NONCE_KEY);

  if (state !== savedState) {
    console.error("Google OAuth state mismatch — possible CSRF attack");
    return null;
  }

  // Clean the fragment so it doesn't interfere with routing
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  return { idToken };
}
