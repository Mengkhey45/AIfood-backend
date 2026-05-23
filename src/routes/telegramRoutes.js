import express from 'express';
import { sendTelegramReport, sendTelegramTest } from '../controllers/telegramController.js';

const router = express.Router();

router.post('/report', sendTelegramReport);
router.post('/test', sendTelegramTest);

export default router;
