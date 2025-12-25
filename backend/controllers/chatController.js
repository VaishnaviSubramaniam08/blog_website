import ChatMessage from "../models/chatSchema.js";

/* ================= GET CHAT MESSAGES ================= */
export const getChatMessages = async (req, res) => {
  const { room } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const messages = await ChatMessage.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name");

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    res.json(reversedMessages);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ================= SAVE CHAT MESSAGE ================= */
export const saveChatMessage = async (messageData) => {
  try {
    const chatMessage = new ChatMessage(messageData);
    await chatMessage.save();
    return chatMessage;
  } catch (err) {
    console.error("Error saving chat message:", err);
    throw err;
  }
};

/* ================= DELETE OLD MESSAGES (CLEANUP) ================= */
export const deleteOldMessages = async (req, res) => {
  const daysOld = parseInt(req.query.days) || 30;
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - daysOld);

  try {
    const result = await ChatMessage.deleteMany({
      createdAt: { $lt: dateThreshold },
      messageType: "user",
    });

    res.json({
      message: `Deleted ${result.deletedCount} messages older than ${daysOld} days`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting old messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
