const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModulTeknisSchema = new mongoose.Schema({
  Modul_teknis_pic: { 
    type: String, 
    required: [true, "PIC TOLONG JANGAN DIKOSONGI"], 
  },
  transportId: {
    type: Schema.Types.ObjectId,
    ref: "Modul_transport", // Reference to Modul_transport
    required: true,
  },
  ruteId: {
    type: Schema.Types.ObjectId,
    ref: "Modul_rute", // Reference to Modul_transport
    required: true,
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
  Fasilitas: { 
    type: [String], 
    default: [] // Array of strings for fasilitas
  },
  Kapasitas_penumpang: { 
    type: Number, 
    required: [true, "KAPASITAS PENUMPANG TOLONG JANGAN DIKOSONGI"], 
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
  Harga_tiket: [{
    label: { type: String },
    harga: { type: Number }
  }],
  Kursi_tersedia: [{
    label: { type: String },
    seats: { type: Map, of: String }
  }],
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
  Teknis:{
    type: String, 
    default:"Proses"
  }
}, { timestamps: true });

module.exports = mongoose.model('Modul_teknis', ModulTeknisSchema);
