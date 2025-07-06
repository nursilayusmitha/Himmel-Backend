const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModulPembayaranSchema = new mongoose.Schema({
  Modul_pembayaran_pic: { 
    type: String, 
    default: null, // Opsi nullable
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "userEksternal", // reference your existing userInternal model
    default: null, // Opsi nullable
  },
  pesananId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Modul_pesanan", // reference your existing userInternal model
  },
  voucherId: {
    type: Schema.Types.ObjectId,
    ref: "Modul_voucher", // reference your existing userInternal model
  },
  buktiTransaksiId: {
    type: String,
  },
  Harga_tiket: { 
    type: Number, 
    required: [true, "HARGA TIKET TOLONG JANGAN DIKOSONGI"], 
  },
  Harga_total: { 
    type: Number, 
    required: [true, "HARGA TIKET TOLONG JANGAN DIKOSONGI"], 
  },
  Metode: { 
    type: String, 
    required: [true, "METODE TOLONG JANGAN DIKOSONGI"], 
  },
  transaksiId:{
    type: String,
  },
  Status: { 
    type: String, 
    default:"N"
  },
}, { timestamps: true });

module.exports = mongoose.model('Modul_pembayaran', ModulPembayaranSchema);
