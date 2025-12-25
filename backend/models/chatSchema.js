import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["user", "system"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatMessageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("ChatMessage", chatMessageSchema);
