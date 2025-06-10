import mongoose from "mongoose";

const userQuizSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
        },
        quizId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            required: true,
        },
        // Keep title for reference, but don't use it as a unique identifier
        title: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

// Create a compound index to ensure a user can only complete a specific quiz once
userQuizSchema.index({ email: 1, quizId: 1 }, { unique: true });


const userQuiz = mongoose.model("UserQuiz", userQuizSchema);

export default userQuiz;
