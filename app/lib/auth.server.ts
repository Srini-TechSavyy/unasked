import { env } from "cloudflare:workers";
import { redirect } from "react-router";

const SESSION_COOKIE = "unasked_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface Session {
  email: string;
  exp: number;
}

function encoder() {
  return new TextEncoder();
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder().encode(payload),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function createSessionToken(email: string): Promise<string> {
  const session: Session = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const payload = base64UrlEncode(encoder().encode(JSON.stringify(session)));
  const signature = await signPayload(payload, env.SESSION_SECRET);
  return `${payload}.${signature}`;
}

export async function parseSessionToken(
  token: string | null,
): Promise<Session | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await signPayload(payload, env.SESSION_SECRET);
  if (signature !== expected) return null;

  try {
    const json = new TextDecoder().decode(base64UrlDecode(payload));
    const session = JSON.parse(json) as Session;
    if (!session.email || !session.exp) return null;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function cookieFlags(secure: boolean): string {
  const parts = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function getSessionFromRequest(request: Request): Promise<Session | null> {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const value = match?.slice(SESSION_COOKIE.length + 1);
  return parseSessionToken(value ?? null);
}

export function isAuthorSession(session: Session | null): boolean {
  if (!session) return false;
  return session.email.toLowerCase() === env.AUTHOR_EMAIL.toLowerCase();
}

export async function requireAuthor(
  request: Request,
): Promise<Session> {
  const session = await getSessionFromRequest(request);
  if (!isAuthorSession(session)) {
    throw redirect("/login");
  }
  return session!;
}

export function sessionSetCookieHeader(
  token: string,
  request: Request,
): string {
  const secure = new URL(request.url).protocol === "https:";
  return `${SESSION_COOKIE}=${token}; ${cookieFlags(secure)}`;
}

export function sessionClearCookieHeader(request: Request): string {
  const secure = new URL(request.url).protocol === "https:";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    secure ? "; Secure" : ""
  }`;
}

export function getOAuthRedirectUri(request: Request): string {
  const url = new URL(request.url);
  return `${url.origin}/auth/google/callback`;
}

export function buildGoogleAuthUrl(request: Request): string {
  const redirectUri = getOAuthRedirectUri(request);
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  request: Request,
): Promise<{ email: string }> {
  const redirectUri = getOAuthRedirectUri(request);
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange authorization code");
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error("Missing access token");
  }

  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  if (!userResponse.ok) {
    throw new Error("Failed to fetch Google profile");
  }

  const profile = (await userResponse.json()) as { email?: string };
  if (!profile.email) {
    throw new Error("Google account has no email");
  }

  return { email: profile.email };
}

export function getSiteUrl(request: Request): string {
  if (env.SITE_URL) {
    return env.SITE_URL.replace(/\/$/, "");
  }
  const url = new URL(request.url);
  return url.origin;
}
