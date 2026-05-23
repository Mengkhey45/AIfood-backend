const getTelegramConfig = () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  return {
    botToken,
    chatId,
    enabled: Boolean(botToken && chatId),
  };
};

const sendTelegramMessage = async (message) => {
  const { botToken, chatId, enabled } = getTelegramConfig();

  if (!enabled) {
    throw new Error('Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });

  const payload = await response.json();

  if (!response.ok || !payload.ok) {
    throw new Error(payload?.description || 'Telegram request failed');
  }

  return payload;
};

const buildDailyReportMessage = (report, aiInsights) => {
  const summary = report?.summary ?? {};
  const totalOrders = summary.totalOrders ?? 0;
  const totalRevenue = Number(summary.totalRevenue ?? 0).toFixed(2);
  const topItems = Array.isArray(summary.topItems) ? summary.topItems.slice(0, 3) : [];
  const recommendation = aiInsights?.recommendations?.[0];

  const topItemsText = topItems.length
    ? topItems.map((item) => `${item.name} (${item.quantity})`).join(', ')
    : 'No top items yet';

  return [
    'Daily report update',
    `Orders: ${totalOrders}`,
    `Revenue: $${totalRevenue}`,
    `Top items: ${topItemsText}`,
    recommendation ? `AI insight: ${recommendation.title}` : null,
  ]
    .filter(Boolean)
    .join('\n');
};

export { buildDailyReportMessage, getTelegramConfig, sendTelegramMessage };
