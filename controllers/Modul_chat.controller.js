const mongoose = require("mongoose");
const ChatInternal = require("../models/Modul_chat.model");
const UserInternal = require("../models/userInternalModels");

// Create chat (send message)
exports.createChat = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const newChat = await ChatInternal.create({ sender, receiver, message });
    res.status(201).json(newChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all chat messages (tanpa pengelompokan)
exports.getAllChatsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await ChatInternal.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      deletedBy: { $ne: userId }
    }).sort({ createdAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat conversation antara user A dan B
exports.getChatWithUser = async (req, res) => {
  try {
    const { userId, targetId } = req.params;
    const chats = await ChatInternal.find({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId }
      ],
      deletedBy: { $ne: userId }
    }).sort({ createdAt: 1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as seen (chat dari target ke user)
exports.markAsSeen = async (req, res) => {
  try {
    const { userId, targetId } = req.body;
    await ChatInternal.updateMany({
      receiver: userId,
      sender: targetId,
      seen: false
    }, { seen: true });
    res.status(200).json({ message: "Marked as seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus semua chat antara user A dan B (hanya dari sisi A)
exports.deleteChatWithUser = async (req, res) => {
  try {
    const { userId, targetId } = req.body;

    if (!userId || !targetId) {
      return res.status(400).json({ message: "userId and targetId are required" });
    }

    const result = await ChatInternal.updateMany(
      {
        $or: [
          { sender: userId, receiver: targetId },
          { sender: targetId, receiver: userId }
        ],
        deletedBy: { $ne: userId } // agar tidak duplikat
      },
      {
        $addToSet: { deletedBy: userId }
      }
    );

    res.status(200).json({
      message: `Chat with user ${targetId} marked as deleted for ${userId}`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Hapus satu pesan untuk user tertentu
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId, userId } = req.body;
    await ChatInternal.findByIdAndUpdate(messageId, {
      $addToSet: { deletedBy: userId }
    });
    res.status(200).json({ message: "Message deleted for user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of unique user yang pernah chat dengan userId (untuk daftar chat card)
exports.getChatGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await ChatInternal.find({
      $or: [{ sender: userId }, { receiver: userId }],
      deletedBy: { $ne: userId }
    }).select("sender receiver").lean();

    const chatWithUsers = new Set();
    chats.forEach(chat => {
      if (chat.sender.toString() !== userId) chatWithUsers.add(chat.sender.toString());
      if (chat.receiver.toString() !== userId) chatWithUsers.add(chat.receiver.toString());
    });

    res.status(200).json([...chatWithUsers]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// (Optional) Get last message for each chat user (preview message di chat card)
exports.getLastMessagesByChat = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Ambil semua chat yang bukan dihapus oleh user ini
    const chats = await ChatInternal.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ],
          deletedBy: { $ne: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender"
            ]
          },
          message: 1,
          createdAt: 1,
          seen: 1,
          receiver: 1
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$message" },
          lastSeen: { $first: "$seen" },
          lastTime: { $first: "$createdAt" }
        }
      },
      { $sort: { lastTime: -1 } }
    ]);

    // Step 2: Lengkapi dengan data user dan unread count
    const result = await Promise.all(
      chats.map(async (chat) => {
        const user = await UserInternal.findById(chat._id).select("userName imageName");
        const unreadCount = await ChatInternal.countDocuments({
          sender: chat._id,
          receiver: userId,
          seen: false,
          deletedBy: { $ne: new mongoose.Types.ObjectId(userId) }
        });

        return {
          _id: chat._id,
          name: user?.userName || "Unknown",
          imageName: user?.imageName || "",
          lastMessage: chat.lastMessage,
          lastSeen: chat.lastSeen,
          lastTime: chat.lastTime,
          unreadCount: unreadCount
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getLastMessagesByChat:", error);
    res.status(500).json({ message: error.message });
  }
};
