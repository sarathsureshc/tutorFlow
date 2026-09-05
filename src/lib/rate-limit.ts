import { NextRequest } from "next/server";

interface RateLimitRecord {
  attempts: number[];
}

// In-memory store for tracking request timestamps per client identifier (IP / account)
// Operates with zero external infrastructure cost on Netlify Free Tier
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale memory records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  rateLimitStore.forEach((record, key) => {
    record.attempts = record.attempts.filter((timestamp) => now - timestamp < windowMs);
    if (record.attempts.length === 0) {
      rateLimitStore.delete(key);
    }
  });
}

/**
 * Extract client IP from incoming request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Return first IP if comma-separated proxy chain
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check whether a client identifier has exceeded the allowed rate limit
 * Defaults: 5 attempts per 60 seconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60 * 1000
): { isAllowed: boolean; remaining: number; retryAfterSec: number } {
  cleanupStaleEntries(windowMs);

  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: [] };

  // Keep only attempts within current sliding window
  const validAttempts = record.attempts.filter((timestamp) => now - timestamp < windowMs);
  record.attempts = validAttempts;
  rateLimitStore.set(key, record);

  if (validAttempts.length >= maxAttempts) {
    const oldestInWindow = validAttempts[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      isAllowed: false,
      remaining: 0,
      retryAfterSec,
    };
  }

  return {
    isAllowed: true,
    remaining: maxAttempts - validAttempts.length,
    retryAfterSec: 0,
  };
}

/**
 * Record a failed attempt
 */
export function recordRateLimitAttempt(key: string) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { attempts: [] };
  record.attempts.push(now);
  rateLimitStore.set(key, record);
}

/**
 * Reset rate limit for a key (e.g. on successful authentication)
 */
export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}
