import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    console.log(`🔒 Arcjet checking: ${req.method} ${req.path} from IP: ${req.ip}`);
    
    const decision = await aj.protect(req);

    console.log(`🔒 Arcjet decision for ${req.path}:`, {
      isDenied: decision.isDenied(),
      reason: decision.reason?.isRateLimit() ? 'rateLimit' : 
               decision.reason?.isBot() ? 'bot' : 'other',
      results: decision.results
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        console.log(`🚫 Rate limit exceeded for ${req.path}`);
        return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
      } else if (decision.reason.isBot()) {
        console.log(`🚫 Bot detected for ${req.path}`);
        return res.status(403).json({ message: "Bot access denied." });
      } else {
        console.log(`🚫 Access denied for ${req.path}:`, decision.reason);
        return res.status(403).json({
          message: "Access denied by security policy.",
        });
      }
    }

    // Check for spoofed bots
    if (decision.results.some(isSpoofedBot)) {
      console.log(`🚫 Spoofed bot detected for ${req.path}`);
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bot activity detected.",
      });
    }

    console.log(`✅ Arcjet passed for ${req.path}`);
    next();
  } catch (error) {
    console.log("❌ Arcjet Protection Error:", error);
    // In case of Arcjet failure, allow the request to proceed
    console.log("⚠️ Arcjet failed, allowing request to continue");
    next();
  }
};