import { db } from "../config/firebase.js";

export const generateReportData = async (timeframe = 'daily') => {
  try {
    const snapshot = await db.collection("orders").get();
    let orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter by timeframe
    const now = new Date();
    if (timeframe === 'daily') {
      // Get today's orders
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      orders = orders.filter(o => o.createdAt >= startOfDay);
    } else if (timeframe === 'weekly') {
      // Get last 7 days orders
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
      orders = orders.filter(o => o.createdAt >= startOfWeek);
    }

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let itemCounts = {};

    const reportItems = [];

    orders.forEach(order => {
      totalRevenue += order.total || 0;
      
      const items = order.items || [];
      items.forEach(item => {
        const rowTotal = Number((item.quantity || 0) * (item.price || 0));

        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }
        
        // Add row for detailed report
        reportItems.push({
          orderId: order.id,
          date: order.createdAt,
          itemName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: rowTotal,
          category: item.category || 'N/A'
        });
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      success: true,
      timeframe,
      summary: {
        totalRevenue,
        totalOrders,
        topItems
      },
      details: reportItems // For CSV export
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Could not generate report data");
  }
};
