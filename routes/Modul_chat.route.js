const express = require("express");
const router = express.Router();
const chatInternalController = require("../controllers/Modul_chat.controller");

// Create new chat (send message)
router.post("/create", chatInternalController.createChat);

// Get all chats related to a user
router.get("/all/:userId", chatInternalController.getAllChatsByUser);

// Get chat messages between userId and targetId
router.get("/conversation/:userId/:targetId", chatInternalController.getChatWithUser);

// Mark messages from target as seen
router.put("/mark-seen", chatInternalController.markAsSeen);

// Delete chat conversation with target (soft delete only for user)
router.put("/delete-chat", chatInternalController.deleteChatWithUser);

// Delete single message (soft delete only for user)
router.put("/delete-message", chatInternalController.deleteMessage);

// Get list of userIds user has chatted with (for chat grouping)
router.get("/chat-groups/:userId", chatInternalController.getChatGroups);

// (Optional) Get preview last message per chat user
router.get("/last-messages/:userId", chatInternalController.getLastMessagesByChat);

module.exports = router;

