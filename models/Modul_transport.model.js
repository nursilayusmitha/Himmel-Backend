const mongoose = require('mongoose');

const ModulTransportSchema = new mongoose.Schema({
  Modul_transport_pic: { 
    type: String, 
    required: [true, "PIC TOLONG JANGAN DIKOSONGI"], },
  Jenis_kendaraan: { 
    type: String, 
    required: [true, "JENIS KENDARAAN TOLONG JANGAN DIKOSONGI"], },
  Nama_kendaraan: { 
    type: String, 
    required: [true, "NAMA KENDARAAN TOLONG JANGAN DIKOSONGI"], },
  Nomor_kendaraan: { 
    type: String, 
    required: [true, "NOMOR KENDARAAN TOLONG JANGAN DIKOSONGI"], },
  Tanggal_pembuatan: { 
    type: Date, 
    required: [true, "TANGGAL PEMBUATAN KENDARAAN TOLONG JANGAN DIKOSONGI"], },
  Kapasitas_penumpang: { 
    type: Number, 
    required: [true, "KAPASITAS PENUMPANG TOLONG JANGAN DIKOSONGI"], },
   Harga_kursi: [
    {
      label: { type: String },
      qty: { type: Number },
    }
  ], // Array of objects for Harga_kursi
  Fasilitas: { 
    type: [String], 
    default: [] }, // Array of strings for fasilitas
  Status: { 
    type: String, 
    required: [true, "STATUS TOLONG JANGAN DIKOSONGI"], 
    default:"Y"
  },
  Status_operasional: { 
    type: String, 
    enum: ["enable", "disable"],
    default: "enable" //  active dan inactive 
    },
  Operator_kendaraan: { 
    type: String, 
    required: [true, "OPERATOR KENDARAAN TOLONG JANGAN DIKOSONGI"], },
}, { timestamps: true });

module.exports = mongoose.model('Modul_transport', ModulTransportSchema);
