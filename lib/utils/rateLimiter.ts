// lib/utils/rateLimiter.ts
const ipRequestMap = new Map<string, { count: number; timestamp: number }>();

type RateLimitOptions = {
  limit: number;
  timeWindow: number; // in milliseconds
};

export function rateLimit(ip: string, options: RateLimitOptions) {
  const currentTime = Date.now();
  const { limit, timeWindow } = options;

  const record = ipRequestMap.get(ip);

  if (!record || currentTime - record.timestamp > timeWindow) {
    ipRequestMap.set(ip, { count: 1, timestamp: currentTime });
    return { success: true };
  }

  if (record.count < limit) {
    record.count++;
    ipRequestMap.set(ip, record);
    return { success: true };
  }

  return { success: false };
}
