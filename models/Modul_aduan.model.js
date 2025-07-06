const mongoose = require("mongoose");
const { Schema } = mongoose;

const percakapanSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "percakapan.senderType",
    },
    senderType: {
      type: String,
      required: true,
      enum: ["userEksternal", "userInternal"],
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    waktu: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aduanPelangganSchema = new Schema(
  {
    modul_pic: [
      {
        type: Schema.Types.ObjectId,
        ref: "userInternal",
      }
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "userEksternal",
      required: false, // ❗ userId tidak wajib
    },
    nama: {
      type: String,
    },
    noTelp: {
      type: String,
    },
    email: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    description: {
      type: String, // otomatis mendukung paragraf panjang
    },
    aduan: {
      type: String,
      required: true,
    },
    solusi: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Problem", "Solved", "Developer", "Prioritize", "Progress", "Done"],
      default: "Problem",
    },
    percakapan: [percakapanSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AduanPelanggan", aduanPelangganSchema);
