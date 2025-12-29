import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { crateOrder, getUserOrders } from "../controller/order.controller.js";

const router = Router();

router.post("/",protectRoute,crateOrder);
router.get("/", protectRoute, getUserOrders);

export default router;