import express from "express";
import { analyzeOrders } from "../controllers/aiController.js";

const router = express.Router();

router.post("/analyze", analyzeOrders);

export default router;