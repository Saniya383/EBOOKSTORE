import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		orderItems: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		discount: {
			type: Number,
			default: 0,
		},
		stripeSessionId: {
			type: String,
			unique: true,
			sparse: true, // Allow multiple null values
		},
		paymentMethod: {
			type: String,
			enum: ["credit_card", "debit_card", "net_banking", "upi", "wallet"],
			default: "credit_card"
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "completed", "failed", "refunded"],
			default: "pending"
		},
		cardDetails: {
			lastFour: {
				type: String,
				trim: true,
			},
			expiryDate: {
				type: String,
				trim: true,
			}
		}
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
