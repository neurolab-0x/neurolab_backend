import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getCart, addProductToCart, removeProductFromCart } from "../controllers/cart.controllers.js";

const cart_router = express.Router();

cart_router.get("/cart", authenticate, getCart);
cart_router.post("/cart/:productId", authenticate, addProductToCart);
cart_router.delete("/cart/:productId", authenticate, removeProductFromCart);

export default cart_router;