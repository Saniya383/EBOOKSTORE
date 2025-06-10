import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Check, Loader2 } from "lucide-react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { usePaymentAnalyticsStore } from "../stores/usePaymentAnalyticsStore";
import toast from "react-hot-toast";

const PaymentGateway = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart, coupon, clearCart } = useCartStore();
  const { recordSuccessfulPayment, recordFailedPayment } = usePaymentAnalyticsStore();
  const [formState, setFormState] = useState({
    cardNumber: "", 
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Validate form
      if (!formState.cardNumber || !formState.cardHolder || !formState.expiryDate || !formState.cvv) {
        throw new Error("Please fill in all card details");
      }
      
      // Validate cart
      if (!cart || cart.length === 0) {
        throw new Error("Your cart is empty");
      }
      
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Determine payment method based on card number
      let paymentMethod = "credit_card";
      if (formState.cardNumber.startsWith("5")) {
        paymentMethod = "debit_card";
      } else if (formState.cardNumber.startsWith("6")) {
        paymentMethod = "net_banking";
      } else if (formState.cardNumber.startsWith("9")) {
        paymentMethod = "upi";
      } else if (formState.cardNumber.startsWith("8")) {
        paymentMethod = "wallet";
      }
      
      // For demo purposes, we'll simulate a successful payment without making an actual API call
      // This ensures the flow works even if the backend isn't fully set up
      console.log("Processing payment with:", {
        cardNumber: `xxxx-xxxx-xxxx-${formState.cardNumber.slice(-4)}`,
        cardHolder: formState.cardHolder,
        paymentMethod,
        amount: cart.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0)
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the successful payment
      console.log("Payment successful!");
      
      // Record the successful payment in analytics
      recordSuccessfulPayment(paymentMethod);
      
      // Clear cart and redirect to success page
      toast.success("Payment processed successfully!");
      clearCart();
      
      // Navigate to success page
      navigate("/purchase-success");
    } catch (error) {
      console.error("Payment error:", error);
      
      // Determine payment method for failed payment
      let paymentMethod = "credit_card";
      if (formState.cardNumber.startsWith("5")) {
        paymentMethod = "debit_card";
      } else if (formState.cardNumber.startsWith("6")) {
        paymentMethod = "net_banking";
      } else if (formState.cardNumber.startsWith("9")) {
        paymentMethod = "upi";
      } else if (formState.cardNumber.startsWith("8")) {
        paymentMethod = "wallet";
      }
      
      // Record the failed payment in analytics
      recordFailedPayment(paymentMethod);
      
      // Handle different types of errors
      if (error.message) {
        setError(error.message);
        toast.error(error.message);
      } else {
        setError("An unexpected error occurred");
        toast.error("Payment failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6">
      <div className="bg-emerald-600 p-4 rounded-t-lg -m-4 mb-4 sm:-m-6 sm:mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <CreditCard className="mr-2" /> Secure Payment
          </h2>
          <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium text-black">
            Test Mode
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="4242 4242 4242 4242"
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
            value={formState.cardNumber}
            onChange={handleChange}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Use any card number for testing
          </p>
        </div>

        <div>
          <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-300 mb-1">
            Card Holder Name
          </label>
          <input
            type="text"
            id="cardHolder"
            name="cardHolder"
            placeholder="John Doe"
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
            value={formState.cardHolder}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              placeholder="MM/YY"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
              value={formState.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
              value={formState.cvv}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium flex items-center transition-colors disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2" size={18} />
                Pay Now
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentGateway; 