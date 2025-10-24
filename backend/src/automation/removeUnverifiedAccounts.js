import cron from "node-cron";
import User from "../models/User.js";

export const removeUnverifiedAccounts = () => {
  // Run every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const result = await User.deleteMany({
        accountVerified: false,
        createdAt: { $lt: thirtyMinutesAgo },
      });
      
      if (result.deletedCount > 0) {
        console.log(`Deleted ${result.deletedCount} unverified accounts`);
      }
    } catch (error) {
      console.error("Error removing unverified accounts:", error);
    }
  });
};