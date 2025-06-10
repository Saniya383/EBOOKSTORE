import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const router = express.Router();

// Process fake payment
router.post("/process", protectRoute, async (req, res) => {
  try {
    const { products, couponCode, paymentMethod, cardDetails } = req.body;
    const userId = req.user._id;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in cart" });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item._id}` });
      }

      const price = product.price;
      const quantity = item.quantity;
      totalAmount += price * quantity;

      orderItems.push({
        product: product._id,
        quantity,
        price
      });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      // Simple discount logic - in a real app, you'd validate the coupon code
      discount = totalAmount * 0.1; // 10% discount
      totalAmount = totalAmount - discount;
    }

    // Simulate payment success/failure (90% success rate)
    const isPaymentSuccessful = Math.random() < 0.9;
    const paymentStatus = isPaymentSuccessful ? "completed" : "failed";

    // Create order
    const order = new Order({
      user: userId,
      orderItems,
      totalAmount,
      discount,
      paymentMethod,
      paymentStatus,
      cardDetails: {
        lastFour: cardDetails?.lastFour || "1234",
        expiryDate: cardDetails?.expiryDate || "12/25"
      }
    });

    await order.save();

    // Return response
    res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
});

export default router;