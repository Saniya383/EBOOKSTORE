import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// Simplified mock functions for Stripe-free implementation
export const createCheckoutSession = async (req, res) => {
	try {
		res.status(200).json({ 
			message: "Using custom payment gateway instead of Stripe. Please use the process-fake-payment endpoint." 
		});
	} catch (error) {
		console.error("Error in createCheckoutSession:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		res.status(200).json({ 
			message: "Using custom payment gateway instead of Stripe. Please use the process-fake-payment endpoint." 
		});
	} catch (error) {
		console.error("Error in checkoutSuccess:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}

export const processFakePayment = async (req, res) => {
  try {
    console.log("Processing fake payment with data:", req.body);
    const { products, couponCode, paymentMethod } = req.body;
    
    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      console.log("Invalid products array:", products);
      return res.status(400).json({ message: "Invalid or empty products array" });
    }
    
    // Validate each product has required fields
    for (const product of products) {
      if (!product._id || typeof product.price !== 'number' || typeof product.quantity !== 'number') {
        console.log("Invalid product data:", product);
        return res.status(400).json({ 
          message: "Invalid product data. Each product must have _id, price, and quantity." 
        });
      }
    }
    
    // Calculate total amount
    let totalAmount = products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    
    console.log("Total amount calculated:", totalAmount);
    
    // Apply coupon if provided
    if (couponCode) {
      try {
        const coupon = await Coupon.findOne({ 
          code: couponCode, 
          userId: req.user._id, 
          isActive: true 
        });
        
        if (coupon) {
          totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
          
          // Deactivate the coupon after use
          coupon.isActive = false;
          await coupon.save();
          console.log("Coupon applied and deactivated:", couponCode);
        } else {
          console.log("Coupon not found or not active:", couponCode);
        }
      } catch (couponError) {
        console.error("Error processing coupon:", couponError);
        // Continue with payment even if coupon processing fails
      }
    }
    
    // Always make payment successful for now to debug the 500 error
    const isPaymentSuccessful = true; // Math.random() < 0.9;
    
    console.log("Creating order with user:", req.user._id);
    
    // Create a new order
    const newOrder = new Order({
      user: req.user._id,
      products: products.map(product => ({
        product: product._id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount,
      paymentMethod: paymentMethod || "credit_card",
      paymentStatus: isPaymentSuccessful ? "completed" : "failed"
    });
    
    console.log("Saving order...");
    await newOrder.save();
    console.log("Order saved successfully:", newOrder._id);
    
    // If payment failed, return error
    if (!isPaymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: "Payment failed. Please try again with a different card.",
      });
    }
    
    // If total amount is high enough, create a new coupon for the user
    if (totalAmount >= 200) {
      try {
        await createNewCoupon(req.user._id);
        console.log("New coupon created for user:", req.user._id);
      } catch (couponError) {
        console.error("Error creating reward coupon:", couponError);
        // Continue with payment even if coupon creation fails
      }
    }
    
    // Payment successful
    res.status(200).json({
      success: true,
      message: "Payment successful and order created",
      orderId: newOrder._id,
      totalAmount
    });
    
  } catch (error) {
    console.error("Error processing fake payment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Error processing payment", 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};
