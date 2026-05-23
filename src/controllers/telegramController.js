import { generateAIInsights } from '../services/aiAnalysisService.js';
import { generateReportData } from '../services/reportService.js';
import { buildDailyReportMessage, sendTelegramMessage } from '../services/telegramService.js';

export const sendTelegramReport = async (req, res) => {
  try {
    const timeframe = req.body?.timeframe || req.query?.timeframe || 'daily';
    const report = await generateReportData(timeframe);
    const aiInsights = await generateAIInsights();
    const message = buildDailyReportMessage(report, aiInsights.data ?? aiInsights);

    const result = await sendTelegramMessage(message);

    res.json({
      success: true,
      message: 'Telegram message sent.',
      data: {
        report: report.summary,
        telegram: result.result,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendTelegramTest = async (req, res) => {
  try {
    const message = req.body?.message || 'RestroAI notification test message.';
    const result = await sendTelegramMessage(message);

    res.json({
      success: true,
      message: 'Telegram test message sent.',
      data: result.result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
