const Message = require("../models/Message");

// @desc    Send chat message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, appointmentId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and message text are required",
      });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      appointmentId: appointmentId || null,
      message,
    });

    const populatedMsg = await Message.findById(newMessage._id)
      .populate("senderId", "name role")
      .populate("receiverId", "name role");

    res.status(201).json({
      success: true,
      data: populatedMsg,
    });
  } catch (error) {
    console.error("[Send Message Error]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// @desc    Get message history between current user and specified user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    })
      .populate("senderId", "name role")
      .populate("receiverId", "name role")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history",
    });
  }
};

// @desc    Mark message as seen
// @route   PUT /api/messages/:id/seen
// @access  Private
const markSeen = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { seen: true },
      { new: true }
    );

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markSeen,
};
