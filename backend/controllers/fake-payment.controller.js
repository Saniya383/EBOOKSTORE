import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

/**
 * Process a fake payment and create an order
 */
export const processFakePayment = async (req, res) => {
  try {
    const { products, couponCode, paymentMethod } = req.body;
    
    // Basic validation
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Your cart is empty or invalid" 
      });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    try {
      totalAmount = products.reduce((sum, item) => {
        const price = parseFloat(item.price);
        const quantity = parseInt(item.quantity, 10);
        
        if (isNaN(price) || isNaN(quantity)) {
          throw new Error(`Invalid price or quantity for product ${item._id}`);
        }
        
        return sum + (price * quantity);
      }, 0);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Apply coupon if provided
    let appliedCoupon = null;
    if (couponCode) {
      try {
        appliedCoupon = await Coupon.findOne({
          code: couponCode,
          userId: req.user._id,
          isActive: true
        });
        
        if (appliedCoupon) {
          const discountAmount = (totalAmount * appliedCoupon.discountPercentage) / 100;
          totalAmount = totalAmount - discountAmount;
        }
      } catch (error) {
        console.error("Error applying coupon:", error);
        // Continue without coupon if there's an error
      }
    }
    
    // Create order items
    const orderItems = products.map(item => ({
      product: item._id,
      quantity: parseInt(item.quantity, 10),
      price: parseFloat(item.price)
    }));
    
    // Create the order
    const order = new Order({
      user: req.user._id,
      products: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paymentMethod: paymentMethod || "credit_card",
      paymentStatus: "completed" // Always successful for now
    });
    
    // Save the order
    await order.save();
    
    // Deactivate coupon if used
    if (appliedCoupon) {
      appliedCoupon.isActive = false;
      await appliedCoupon.save();
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      orderId: order._id,
      totalAmount: order.totalAmount
    });
    
  } catch (error) {
    console.error("Payment processing error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your payment",
      error: error.message
    });
  }
};

/**
 * Get payment methods available for the user
 */
export const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      { id: "credit_card", name: "Credit Card", description: "Pay with any credit card" },
      { id: "debit_card", name: "Debit Card", description: "Pay with any debit card" },
      { id: "net_banking", name: "Net Banking", description: "Pay through your bank account" },
      { id: "upi", name: "UPI", description: "Pay using UPI apps" },
      { id: "wallet", name: "Wallet", description: "Pay using digital wallets" }
    ];
    
    return res.status(200).json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
      error: error.message
    });
  }
};