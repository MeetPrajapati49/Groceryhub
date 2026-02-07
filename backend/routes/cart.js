import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ error: "Invalid product" });
    }
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }
    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(400).json({ error: "Cart not found" });
    }
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(400).json({ error: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(400).json({ error: "Item not in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

export default router;

