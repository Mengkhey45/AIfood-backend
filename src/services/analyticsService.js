import { db } from "../config/firebase.js";

export const getAnalyticsData = async () => {
  try {
    const snapshot = await db.collection("orders").get();
    const orders = snapshot.docs.map(doc => doc.data());

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let itemCounts = {};
    let hourCounts = {};
    let categoryCounts = {};
    
    // Process each order
    orders.forEach(order => {
      // Assuming order has an 'items' array or is an array of items, let's check orderController.js to see how orders are shaped.
      // Wait, let me implement the logic assuming order has a cart array or similar. 
      // Actually, looking at the frontend menu page, a cart item looks like: { id, name, price, quantity }.
      // The order should ideally contain { items: [{ id, name, price, quantity }], total: number, createdAt: string }.
      
      const items = order.items || [];
      
      items.forEach(item => {
        // Revenue
        totalRevenue += item.price * item.quantity;
        
        // Item count
        if (itemCounts[item.name]) {
          itemCounts[item.name] += item.quantity;
        } else {
          itemCounts[item.name] = item.quantity;
        }

        // Category count (if category exists)
        if (item.category) {
            if (categoryCounts[item.category]) {
                categoryCounts[item.category] += item.quantity;
            } else {
                categoryCounts[item.category] = item.quantity;
            }
        }
      });

      // Peak ordering time
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        const hour = date.getHours(); // 0-23
        if (hourCounts[hour]) {
          hourCounts[hour]++;
        } else {
          hourCounts[hour] = 1;
        }
      }
    });

    // Determine Best Selling Items
    const sortedItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
      
    const bestSellingItem = sortedItems.length > 0 ? sortedItems[0] : null;

    // Determine Peak Hours
    const sortedHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count);
      
    let peakHour = null;
    if (sortedHours.length > 0) {
        const topHour = sortedHours[0].hour;
        const ampm = topHour >= 12 ? 'PM' : 'AM';
        const formattedHour = topHour % 12 || 12;
        peakHour = `${formattedHour}:00 ${ampm}`;
    }

    // Format Data for charts
    // 1. Popular Items Chart Data
    const popularItemsChart = sortedItems.slice(0, 5).map(item => ({
        name: item.name,
        sales: item.quantity
    }));

    // 2. Sales Trend (by day/hour) - simple implementation for now
    const salesTrendData = []; // Can be expanded

    // 3. Peak Hours Chart Data
    const peakHoursChart = sortedHours.map(h => ({
        time: `${h.hour % 12 || 12}:00 ${h.hour >= 12 ? 'PM' : 'AM'}`,
        orders: h.count
    })).sort((a, b) => {
        // Try to sort chronologically, or leave sorted by count?
        // Usually peak hour chart in UI displays time chronologically
        const parseTime = (t) => {
            const [time, modifier] = t.time.split(' ');
            let [hours] = time.split(':');
            if (hours === '12') hours = '0';
            if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
            return parseInt(hours, 10);
        };
        return parseTime(a) - parseTime(b);
    });

    // 4. Revenue Breakdown Chart Data
    const revenueBreakdownChart = Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value
    }));

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        bestSellingItem: bestSellingItem ? bestSellingItem.name : "N/A",
        bestSellingItemCount: bestSellingItem ? bestSellingItem.quantity : 0,
        peakHour: peakHour || "N/A",
        charts: {
            popularItems: popularItemsChart,
            peakHours: peakHoursChart,
            revenueBreakdown: revenueBreakdownChart,
            salesTrend: salesTrendData
        }
      }
    };
  } catch (error) {
    console.error("Error generating analytics:", error);
    throw new Error("Could not generate analytics data");
  }
};
