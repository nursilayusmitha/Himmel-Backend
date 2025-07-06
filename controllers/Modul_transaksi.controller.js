const ModulTransaksi = require("../models/Modul_transaksi.model");
const ModulPembayaran = require("../models/Modul_pembayaran.model");
const ModulPesanan = require("../models/Modul_pesanan.model");
const UserEksternal = require("../models/userEksternalModels");

const QRCode = require('qrcode');
const path = require("path");
const fs = require("fs");

const createTransaksi = async (req, res) => {
  try {
    const pembayaranId = req.params.pembayaranId;
    let { Money, Modul_transaksi_pic, buktiTransaksiId } = req.body;

    if (!pembayaranId) {
      return res.status(400).json({ message: "ID Pembayaran tidak ditemukan di URL" });
    }

    const pembayaran = await ModulPembayaran.findById(pembayaranId).populate("pesananId");
    if (!pembayaran) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    const pesanan = pembayaran.pesananId;
    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Konversi ke angka untuk memastikan perhitungan benar
    const Harga_tiket = Number(pembayaran.Harga_total) || 0;
    Money = Number(Money) || 0;

    console.log("Debug: Harga Tiket ->", Harga_tiket);
    console.log("Debug: Money ->", Money);

    if (pembayaran.Metode === "Mitra") {
      if (Money < Harga_tiket) {
        return res.status(400).json({ message: "Uang yang diberikan kurang atau tidak diisi" });
      }
      Change = Money - Harga_tiket; // ✅ Perbaiki Change untuk pembayaran tunai
      console.log("Debug: Change (Kembalian) ->", Change);
    } else if (pembayaran.Metode === "Qris") {
      if (!buktiTransaksiId) {
        return res.status(400).json({ message: "Bukti transaksi Qris wajib diisi" });
      }
      Money = Harga_tiket; // ✅ QRIS harus selalu sama dengan harga tiket
      Change = 0; // ✅ QRIS tidak memiliki kembalian
    }

    // Pastikan Change benar-benar disimpan di database
    const transaksiBaru = new ModulTransaksi({
      Modul_transaksi_pic,
      pembayaranId,
      pesananId: pesanan._id,
      userId: null,
      userName: pesanan.userName,
      Harga_tiket: Harga_tiket,
      Money: Money,
      Change: Change, // 🛠️ FIXED: Change sekarang benar-benar disimpan!
      buktiTransaksiId: pembayaran.Metode === "Qris" ? buktiTransaksiId : null,
      Status: "Y",
    });

    console.log("Debug: Transaksi yang akan disimpan ->", transaksiBaru);

    await transaksiBaru.save();

    pembayaran.transaksiId = transaksiBaru._id;
    pembayaran.Status = "selesai";

    if (pembayaran.Metode === "Qris") {
      pembayaran.buktiTransaksiId = buktiTransaksiId;
    }

    await pembayaran.save();

    if (pembayaran.Status === "selesai") {
      pesanan.Status = "tiket";

      if (pembayaran.Metode === "Qris") {
        pesanan.buktiTransaksiId = buktiTransaksiId;
      }

      await pesanan.save();
    }

    res.status(201).json({ message: "Transaksi berhasil!", data: transaksiBaru });
  } catch (error) {
    console.error("Error saat membuat transaksi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};



// Mendapatkan semua transaksi
const getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await ModulTransaksi.find()
      .populate("pembayaranId")
      .populate("pesananId")
      .populate("userId", "nama email");

    res.status(200).json({ success: true, message: "Data transaksi berhasil diambil", data: transaksi });
  } catch (error) {
    console.error("❌ Error saat mengambil data transaksi:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil data transaksi", error: error.message });
  }
};

// Mendapatkan transaksi berdasarkan ID
const getTransaksiById = async (req, res) => {
  try {
    const transaksi = await ModulTransaksi.findById(req.params.id)
      .populate("pembayaranId")
      .populate("pesananId")
      .populate("userId", "nama email");

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({ success: true, message: "Data transaksi berhasil diambil", data: transaksi });
  } catch (error) {
    console.error("❌ Error saat mengambil transaksi:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil transaksi", error: error.message });
  }
};

const getStrukTransaksi = async (req, res) => {
  try {
    const transaksi = await ModulTransaksi.findById(req.params.id)
      .populate({
        path: "pembayaranId",
        populate: {
          path: "pesananId",
        },
      })
      .populate("userId", "nama email");

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }


    const pesanan = transaksi.pembayaranId.pesananId;
    
    // Cek apakah QR Code ada
    let qrCodeUrl = null;
    if (pesanan.qrCode) {
      const qrPath = path.join(__dirname, "..", pesanan.qrCode);

      if (fs.existsSync(qrPath)) {
        qrCodeUrl = `${req.protocol}://${req.get("host")}/images/qrcodes/${path.basename(qrPath)}`;
      }
    }

    const response = {
      userName: pesanan.userName,
      jenis_kendaraan: pesanan.Jenis_kendaraan,
      nama_kendaraan: pesanan.Nama_kendaraan,
      nomor_kendaraan: pesanan.Nomor_kendaraan,
      kode_kursi: pesanan.Kode_kursi,
      tanggal_berangkat: pesanan.Datetime_berangkat,
      harga_tiket: transaksi.pembayaranId.Harga_tiket,
      harga_total: transaksi.pembayaranId.Harga_total,
      qrCode: qrCodeUrl,
      diskon: transaksi.pembayaranId.Harga_tiket - transaksi.pembayaranId.Harga_total, // Perhitungan diskon
      bayar_cash: transaksi.Money,
      kembali: transaksi.Change,
      metode: transaksi.pembayaranId.Metode,
      bukti_transaksi: transaksi.buktiTransaksiId,
      transaksi_pic: transaksi.Modul_transaksi_pic
    };
    

    res.status(200).json({ success: true, message: "Struk transaksi berhasil diambil", data: response });
  } catch (error) {
    console.error("❌ Error saat mengambil struk transaksi:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil struk transaksi", error: error.message });
  }
};

const getStrukPesanan = async (req, res) => {
  try {
    const transaksi = await ModulTransaksi.findOne({ pesananId: req.params.id })
      .populate("pembayaranId")
      .populate("pesananId") // langsung populate pesananId dari ModulTransaksi
      .populate("userId", "nama email");

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    const pesanan = transaksi.pesananId;

    let qrCodeUrl = null;
    if (pesanan.qrCode) {
      const qrPath = path.join(__dirname, "..", pesanan.qrCode);
      if (fs.existsSync(qrPath)) {
        qrCodeUrl = `${req.protocol}://${req.get("host")}/images/qrcodes/${path.basename(qrPath)}`;
      }
    }

    const response = {
      userName: pesanan.userName,
      jenis_kendaraan: pesanan.Jenis_kendaraan,
      nama_kendaraan: pesanan.Nama_kendaraan,
      nomor_kendaraan: pesanan.Nomor_kendaraan,
      kode_kursi: pesanan.Kode_kursi,
      tanggal_berangkat: pesanan.Datetime_berangkat,
      harga_tiket: transaksi.pembayaranId?.Harga_tiket || 0,
      harga_total: transaksi.pembayaranId?.Harga_total || 0,
      qrCode: qrCodeUrl,
      diskon:
        (transaksi.pembayaranId?.Harga_tiket || 0) -
        (transaksi.pembayaranId?.Harga_total || 0),
      bayar_cash: transaksi.Money,
      kembali: transaksi.Change,
      metode: transaksi.pembayaranId?.Metode || "-",
      bukti_transaksi: transaksi.buktiTransaksiId,
      transaksi_pic: transaksi.Modul_transaksi_pic,
    };

    res.status(200).json({
      success: true,
      message: "Struk berdasarkan pesanan berhasil diambil",
      data: response,
    });
  } catch (error) {
    console.error("❌ Error saat mengambil struk pesanan:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan",
      error: error.message,
    });
  }
};


module.exports = {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  getStrukTransaksi,
  getStrukPesanan
};
