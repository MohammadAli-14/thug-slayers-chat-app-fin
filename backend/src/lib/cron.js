
//CRON JOB EXPLANATION
//This is the cron job that will run every 14 minutes.
//CRON jobs are scheduled tasks that run at specific intervals. 
// They are often used for tasks like sending emails, cleaning up databases, or performing regular 
// maintenance. In this case, we are using a cron job to check for expired tokens in the database
//  and delete them.
//We want to send 1 get request every 14 minutes to the server to check if there are any expired tokens 
// in the database.

//How to define a schedule
//You define a schedule using a cron expression, which consists of five fields representing

//!Minute, hour, day of month, month, and day of week.

//EXMAPLE AND EXPLANATION OF CRON JOBS
// * 14 * * * *  - At every 14 minutes
// * 0 0 * * 0   - At midnight on every sunday
// * 30 3 15 * * - At 3:30 AM on the 15th of every month
// * 0  0 1 1 * - At midnight on January 1st every year
// * 0 * * * * - At every hour


import cron from "cron";
import https from "https";  // Changed back to https
import { URL } from "url";

const job = new cron.CronJob("*/14 * * * *", function () {
  const apiUrl = new URL(process.env.CLIENT_URL);
  
  const options = {
    hostname: apiUrl.hostname,
    path: `${apiUrl.pathname}/health`.replace('//', '/'), // Ensure proper path
    method: 'GET',
    port: apiUrl.port || 443,
    headers: {
      'User-Agent': 'Thug Slayers-Health-Check'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log("Health check successful");
    } else {
      console.log(`Health check failed with status: ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    console.error('Health check error:', e.message);
  });

  req.end();
});

export default job;