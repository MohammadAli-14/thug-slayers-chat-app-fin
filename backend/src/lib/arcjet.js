import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

// Check if Arcjet key is available
const hasArcjetKey = ENV.ARCJET_KEY && ENV.ARCJET_KEY !== "your_arcjet_key_here";

const aj = hasArcjetKey ? arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
      ],
    }),
    // Increased rate limit for testing
    slidingWindow({
      mode: "LIVE",
      max: 1000, // Increased from 400 to 1000
      interval: 60, // per minute
    }),
  ],
}) : null;

export default aj;