const mongoose = require('mongoose');

const ModulVoucherSchema = new mongoose.Schema({
  Modul_voucher_pic: { 
    type: String, 
    required: [true, "PIC TOLONG JANGAN DIKOSONGI"], 
  },
  Kode_voucher: {
    type: String,
    required: [true, "KODE VOUCHER TOLONG JANGAN DIKOSONGI"],
    unique: true,
  },
  Nama_voucher: {
    type: String,
    required: [true, "NAMA VOUCHER TOLONG JANGAN DIKOSONGI"],
  },
  User_voucher: {
    type: String,
    enum: ["semua","internal", "eksternal"],
    default: "semua" //  active dan inactive
  },
  Persen_potongan: { 
    type: Number, 
  },
  Harga_potongan: { 
    type: Number, 
  },
  Qty: { 
    type: Number, 
    required: [true, "QTY VOUCHER TOLONG JANGAN DIKOSONGI"], 
  },
  Voucher_status: {
    type: String,
    enum: ["enable", "disable","expired"],
    default: "enable" //  active dan inactive
  },
  Datetime_expired: {
    type: Date,
    required: true,
  },
  Expired_date:{
    type: String,
  },
  Expired_time:{
    type: String,
  },
  isDeleted: {
    type: String,
    default:"N"
  },
}, { timestamps: true });

module.exports = mongoose.model('Modul_voucher', ModulVoucherSchema);