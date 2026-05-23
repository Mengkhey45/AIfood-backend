import express from 'express';

const router = express.Router();

// Simple in-memory mock notifications endpoint
router.get('/', (req, res) => {
  const notifications = [
    { id: 1, text: 'Daily AI insights ready', time: '2 hours' },
    { id: 2, text: 'New order received (#304)', time: '3 hours' },
    { id: 3, text: 'Weekly summary available', time: '1 day' },
  ];

  res.json({ data: notifications });
});

export default router;
