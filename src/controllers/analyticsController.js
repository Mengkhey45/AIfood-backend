import { getAnalyticsData } from "../services/analyticsService.js";

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalyticsData();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
