import express from "express";
import {
	createMenuCategory,
	createMenuItem,
	deleteMenuCategory,
	deleteMenuItem,
	getMenuCategories,
	getMenuItems,
	seedMenuItems,
} from "../controllers/menuController.js";

const router = express.Router();

router.get("/", getMenuItems);
router.get("/categories", getMenuCategories);
router.post("/categories", createMenuCategory);
router.post("/items", createMenuItem);
router.delete("/items/:id", deleteMenuItem);
router.delete("/categories/:id", deleteMenuCategory);
router.post("/seed", seedMenuItems);

export default router;
