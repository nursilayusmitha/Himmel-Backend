const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenEksternalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "userEksternal", // reference your existing userInternal model
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // token expires after 15 minutes
  },
});

module.exports = mongoose.model("TokenEksternal", tokenEksternalSchema);
