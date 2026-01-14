import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// For production, consider using Redis or another distributed store
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean up every minute

interface RateLimitConfig {
  windowMs?: number;  // Time window in milliseconds
  maxRequests?: number;  // Max requests per window
}

export function getClientIp(request: NextRequest): string {
  // Check various headers for the client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier
  return 'unknown';
}

export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const { windowMs = 60000, maxRequests = 20 } = config; // Default: 20 requests per minute

  const clientIp = getClientIp(request);
  const now = Date.now();

  let entry = rateLimitStore.get(clientIp);

  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(clientIp, entry);
    return { allowed: true, remaining: maxRequests - 1, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    {
      status: 429,
      message: 'Too many requests. Please try again later.',
      retryAfter
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(resetTime),
      }
    }
  );
}
