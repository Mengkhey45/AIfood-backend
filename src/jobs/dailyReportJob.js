import cron from "node-cron";
import { generateAIInsights } from "../services/aiAnalysisService.js";
import { generateReportData } from "../services/reportService.js";
import { buildDailyReportMessage, sendTelegramMessage } from "../services/telegramService.js";
import { db } from "../config/firebase.js";

export const startDailyReportJob = () => {
  // Run every day at 23:59 (11:59 PM)
  cron.schedule("59 23 * * *", async () => {
    console.log("Running automated daily report job...");
    try {
      // 1. Generate today's report
      const report = await generateReportData('daily');
      
      // 2. Generate AI insights for today
      const aiInsights = await generateAIInsights();

      // 3. Save the automated report to Firebase
      const reportRef = await db.collection("reports").add({
        date: new Date().toISOString(),
        summary: report.summary,
        aiInsights: aiInsights.data,
      });

      try {
        const message = buildDailyReportMessage(report, aiInsights.data ?? aiInsights);
        await sendTelegramMessage(message);
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError.message);
      }

      console.log(`Daily report job completed successfully. Report ID: ${reportRef.id}`);
    } catch (error) {
      console.error("Automated daily report job failed:", error);
    }
  });

  console.log("Daily report cron job initialized.");
};
