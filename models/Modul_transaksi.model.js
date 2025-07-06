const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModulTransaksiSchema = new mongoose.Schema({
  Modul_transaksi_pic: { 
    type: String, 
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "userEksternal", // reference your existing userInternal model
  },
  pesananId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Modul_pesanan", // reference your existing userInternal model
  },
  pembayaranId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Modul_pembayaran", // reference your existing userInternal model
  },
  userName: {
    type: String,
    required: [true, "NAMA USER TOLONG JANGAN DIKOSONGI"],
  },
  buktiTransaksiId: {
    type: String,
  },
  Harga_tiket: { 
    type: Number, 
    required: [true, "HARGA TIKET TOLONG JANGAN DIKOSONGI"], 
  },
  Money: { 
    type: Number, 
    required: [true, "UANG TOLONG JANGAN DIKOSONGI"], 
  },
Change: { 
  type: Number, 
  required: [true, "KEMBALIAN TOLONG JANGAN DIKOSONGI"], 
},
  Status: { 
    type: String, 
    default:"N"
  },
}, { timestamps: true });

module.exports = mongoose.model('Modul_transaksi', ModulTransaksiSchema);
