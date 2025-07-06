const mongoose = require("mongoose");

const chatInternalSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userInternal",
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userInternal",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "userInternal"
  }],
  deleted: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// Index untuk mempercepat query chat berdasarkan user
chatInternalSchema.index({ sender: 1, receiver: 1 });

module.exports = mongoose.model("chatInternal", chatInternalSchema);
