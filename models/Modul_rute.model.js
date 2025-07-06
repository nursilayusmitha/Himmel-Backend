const mongoose = require('mongoose');

const ModulRuteSchema = new mongoose.Schema({
  Modul_rute_pic: { 
    type: String, 
    required: [true, "PIC TOLONG JANGAN DIKOSONGI"], 
  },
  Jenis_kendaraan: { 
    type: String, 
    required: [true, "JENIS KENDARAAN TOLONG JANGAN DIKOSONGI"], 
  },
  Keberangkatan: { 
    type: Array, 
    required: [true, "RUTE AWAL TOLONG JANGAN DIKOSONGI"], 
  },
  Tujuan: { 
    type: Array, 
    required: [true, "RUTE AKHIR TOLONG JANGAN DIKOSONGI"], 
  },
  Waktu_perjalanan: { 
    type: Number, 
    required: [true, "WAKTU PERJALANAN TOLONG JANGAN DIKOSONGI"], // In minutes or hours
  },
  Harga_tiket: [
    {
      label: { type: String },
      harga: { type: Number },
    }
  ], // Array of objects for Harga_kursi
  Perbaikan: {
    type: String,
    default:"N"
  },
}, { timestamps: true });

module.exports = mongoose.model('Modul_rute', ModulRuteSchema);