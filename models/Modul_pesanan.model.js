const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModulPesananSchema = new mongoose.Schema({
  Modul_pesanan_pic: { 
    type: String, 
  },
  userId: {
    type: Schema.Types.ObjectId,
    default: null, // Opsi nullable
    ref: "userEksternal", // reference your existing userInternal model
  },
  teknisId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Modul_teknis", // reference your existing userInternal model
  },
  userName: {
    type: String,
    required: [true, "NAMA USER TOLONG JANGAN DIKOSONGI"],
  },
  userPhone: {
    type: String,
    required: [true, "NO TELP USER TOLONG JANGAN DIKOSONGI"],
  },
  email: {
    type: String,
    required: [true, "EMAIL USER TOLONG JANGAN DIKOSONGI"],
  },
  Jenis_kendaraan: { 
    type: String, 
    required: [true, "JENIS KENDARAAN TOLONG JANGAN DIKOSONGI"], 
  },
  Nama_kendaraan: { 
    type: String, 
    required: [true, "NAMA KENDARAAN TOLONG JANGAN DIKOSONGI"], 
  },
  Nomor_kendaraan: { 
    type: String, 
    required: [true, "NOMOR KENDARAAN TOLONG JANGAN DIKOSONGI"], 
  },
  Keberangkatan: { 
    type: Array, 
    required: [true, "RUTE AWAL TOLONG JANGAN DIKOSONGI"], 
  },
  Tujuan: { 
    type: Array, 
    required: [true, "RUTE AKHIR TOLONG JANGAN DIKOSONGI"], 
  },
  Kode_kursi: { 
    type: String, 
    required: [true, "KODE KURSI TOLONG JANGAN DIKOSONGI"], 
  },
  Harga_tiket: { 
    type: Number, 
    required: [true, "HARGA TIKET TOLONG JANGAN DIKOSONGI"], 
  },
  Datetime_berangkat: {
    type: Date,
    required: true,
  },
  Berangkat_date:{
    type: String,
  },
  Berangkat_time:{
    type: String,
  },
  Status: { 
    type: String, 
    enum: ["cancel", "order", "tiket", "pending"],
    default: "order" //  active dan inactive
  },
  Verifikasi: { 
    type: String, 
    required: [true, "VERIFIKASI TOLONG JANGAN DIKOSONGI"], 
    default:"N"
  },
  qrCode: {
    type: String,
    default: null,
  },  
}, { timestamps: true });

module.exports = mongoose.model('Modul_pesanan', ModulPesananSchema);
