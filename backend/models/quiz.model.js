import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: function(options) {
              return options.length >= 2; // At least 2 options
            },
            message: "Quiz must have at least 2 options per question"
          }
        },
        answer: {
          type: String,
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Reward tiers based on score
    rewards: [
      {
        minScore: {
          type: Number,
          required: true,
        },
        discountPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        couponPrefix: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;