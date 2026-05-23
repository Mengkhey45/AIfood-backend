import { generateReportData } from "../services/reportService.js";

export const getReport = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'daily' or 'weekly' or 'all'
    const report = await generateReportData(timeframe || 'all');
    res.json(report);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
