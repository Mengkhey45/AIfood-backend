import { generateAIInsights } from "../services/aiAnalysisService.js";

export const analyzeOrders = async (req, res) => {
  try {
    const analysis = await generateAIInsights();

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};