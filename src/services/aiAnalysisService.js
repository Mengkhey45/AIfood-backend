import OpenAI from "openai";
import { db } from "../config/firebase.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const buildLocalInsights = (orders) => {
  if (!orders || orders.length === 0) {
    return {
      recommendations: [
        {
          title: "No orders yet",
          description: "Once orders come in, insights will appear here.",
          type: "insight",
        },
      ],
      summary: "No order data available to analyze yet.",
    };
  }

  let totalRevenue = 0;
  const itemCounts = {};
  const hourCounts = {};

  orders.forEach((order) => {
    totalRevenue += order.total || 0;
    (order.items || []).forEach((item) => {
      if (!item || !item.name) return;
      itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 0);
    });

    if (order.createdAt) {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const topItem = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)[0];

  const peakHour = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count)[0];

  const recommendations = [];

  if (topItem) {
    recommendations.push({
      title: "Promote best seller",
      description: `${topItem.name} is your top item. Consider highlighting it in promotions or combos.`,
      type: "recommendation",
    });
  }

  if (peakHour) {
    const hourLabel = `${((peakHour.hour + 11) % 12) + 1}:00 ${peakHour.hour >= 12 ? "PM" : "AM"}`;
    recommendations.push({
      title: "Prepare for peak time",
      description: `Most orders arrive around ${hourLabel}. Schedule staff and prep ahead of that window.`,
      type: "insight",
    });
  }

  recommendations.push({
    title: "Track daily revenue",
    description: `Current total revenue from orders is $${totalRevenue.toFixed(2)}.`,
    type: "success",
  });

  return {
    recommendations,
    summary: "Local insights generated from current order data.",
  };
};

export const generateAIInsights = async () => {
  let orders = [];
  try {
    const snapshot = await db.collection("orders").get();
    orders = snapshot.docs.map(doc => doc.data());

    // We can limit the orders sent to OpenAI if there are too many
    // For now, let's just send the last 100 orders or summarize it locally first
    const ordersSummary = orders.map(o => ({
      items: o.items ? o.items.map(i => ({ name: i.name, qty: i.quantity })) : [],
      total: o.total || 0,
      time: o.createdAt
    }));

    const prompt = `
You are a restaurant business analyst.

Analyze this order data:
${JSON.stringify(ordersSummary).slice(0, 5000)} // Ensure we don't exceed token limits

Return your analysis in the following structured JSON format:
{
  "recommendations": [
    { "title": "string", "description": "string", "type": "warning | recommendation | insight | success" }
  ],
  "summary": "string"
}

Ensure the response is valid JSON.
`;

    if (!process.env.OPENAI_API_KEY) {
      return { success: true, data: buildLocalInsights(orders) };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const analysisResult = JSON.parse(response.choices[0].message.content);
    
    return {
      success: true,
      data: analysisResult
    };
  } catch (error) {
    const isQuotaError = error?.status === 429 || error?.code === 'insufficient_quota';
    if (isQuotaError) {
      console.warn('AI Analysis quota unavailable; using local fallback insights.');
    } else {
      console.error('AI Analysis error:', error);
    }
    return { success: true, data: buildLocalInsights(orders) };
  }
};
