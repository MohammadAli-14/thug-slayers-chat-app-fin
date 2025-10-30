// Simple in-memory rate limiting as fallback
const requestCounts = new Map();

export const simpleRateLimit = (req, res, next) => {
  // Skip rate limiting for certain paths
  const skipPaths = ['/api/auth/check', '/favicon.ico'];
  if (skipPaths.includes(req.path)) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 500; // Increased limit

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const windowStart = now - windowMs;

  // Remove old requests outside the current window
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }

  // Check if under rate limit
  if (requests.length < maxRequests) {
    requests.push(now);
    next();
  } else {
    console.log(`🚫 Rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
    res.status(429).json({ 
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
    });
  }

  // Clean up old IPs periodically (optional)
  if (Math.random() < 0.01) { // 1% chance to clean up
    for (const [ipKey, ipRequests] of requestCounts.entries()) {
      if (ipRequests.length === 0 || ipRequests[ipRequests.length - 1] < Date.now() - 5 * 60 * 1000) {
        requestCounts.delete(ipKey);
      }
    }
  }
};