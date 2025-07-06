const mongoose = require("mongoose"); // Tambahkan ini di paling atas
const ModulPembayaran = require("../models/Modul_pembayaran.model");
const ModulPesanan = require("../models/Modul_pesanan.model");
const ModulVoucher = require("../models/Modul_voucher.model");
const userEksternal = require("../models/userEksternalModels");
const createPembayaran = async (req, res) => {
  try {
    const pesananId = req.params.pesananId;
    console.log("Pesanan ID dari URL:", pesananId);

    if (!pesananId) {
      return res.status(400).json({ message: "ID Pesanan tidak ditemukan di URL" });
    }

    // Ambil data pesanan dari database
    const pesanan = await ModulPesanan.findById(pesananId);
    console.log("Data pesanan yang ditemukan:", pesanan);

    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const { metode, transaksiId, voucherId, Modul_pembayaran_pic, buktiTransaksiId, userId } = req.body;
    let hargaTiket = pesanan.Harga_tiket;
    let hargaTotal = hargaTiket; // Default sebelum potongan voucher

    // Validasi metode pembayaran
    if (!["Mitra", "Qris"].includes(metode)) {
      return res.status(400).json({ message: "Metode pembayaran tidak valid" });
    }

    // Cek apakah ada voucher yang digunakan
    if (voucherId) {
      const voucher = await ModulVoucher.findById(voucherId);

      if (!voucher) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
      }

      if (voucher.Qty <= 0) {
        return res.status(400).json({ message: "Voucher sudah habis" });
      }

      if (voucher.Voucher_status !== "enable") {
        return res.status(400).json({ message: "Voucher tidak aktif" });
      }

      // Hitung harga setelah diskon
      if (voucher.Persen_potongan) {
        hargaTotal = hargaTiket - (hargaTiket * voucher.Persen_potongan / 100);
      } else if (voucher.Harga_potongan) {
        hargaTotal = hargaTiket - voucher.Harga_potongan;
      }

      // Pastikan harga total tidak negatif
      hargaTotal = Math.max(hargaTotal, 0);

      // Kurangi qty voucher
      await ModulVoucher.findByIdAndUpdate(voucherId, { $inc: { Qty: -1 } });
    }

    // Buat pembayaran baru
    const pembayaranBaru = new ModulPembayaran({
      Modul_pembayaran_pic,
      userId: userId || null, // Simpan userId jika ada, null jika tidak ada
      pesananId,
      buktiTransaksiId: buktiTransaksiId || null, // Pastikan null jika tidak tersedia
      Harga_tiket: hargaTiket,
      Harga_total: hargaTotal,
      Metode: metode,
      transaksiId: transaksiId || null, // Pastikan null jika tidak tersedia
      Status: "Y",
      voucherId: voucherId || null, // Simpan ID voucher jika digunakan
    });

    await pembayaranBaru.save();


// Update status pesanan menjadi "pending"
await ModulPesanan.findByIdAndUpdate(pesananId, { Status: "pending" });

    // Hapus voucher dari userEksternal jika userId dan voucherId tersedia
    // Hapus voucher dari userEksternal jika userId dan voucherId tersedia
if (userId && voucherId) {
  const updatedUser = await userEksternal.findOneAndUpdate(
    { _id: userId },
    { $pull: { voucher: { _id: new mongoose.Types.ObjectId(voucherId) } } }, // Pastikan voucherId dalam bentuk ObjectId
    { new: true } // Kembalikan data terbaru setelah update
  );

  if (updatedUser) {
    console.log(`Voucher ${voucherId} berhasil dihapus dari user ${userId}`);
    console.log("Data user setelah update:", updatedUser);
  } else {
    console.log(`Voucher ${voucherId} gagal dihapus atau user tidak ditemukan`);
  }
}


    res.status(201).json({ message: "Pembayaran berhasil!", data: pembayaranBaru });
  } catch (error) {
    console.error("Error saat membuat pembayaran:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

const createPembayaranMitra = async (req, res) => {
  try {
    const pesananId = req.params.pesananId;
    console.log("Pesanan ID dari URL:", pesananId);

    if (!pesananId) {
      return res.status(400).json({ message: "ID Pesanan tidak ditemukan di URL" });
    }

    // Ambil data pesanan dari database
    const pesanan = await ModulPesanan.findById(pesananId);
    console.log("Data pesanan yang ditemukan:", pesanan);

    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    const { metode, transaksiId, voucherId, Modul_pembayaran_pic, buktiTransaksiId, userId } = req.body;
    let hargaTiket = pesanan.Harga_tiket;
    let hargaTotal = hargaTiket; // Default sebelum potongan voucher

    // Validasi metode pembayaran
    if (!["Mitra", "Qris"].includes(metode)) {
      return res.status(400).json({ message: "Metode pembayaran tidak valid" });
    }

    // Cek apakah ada voucher yang digunakan
    if (voucherId) {
      const voucher = await ModulVoucher.findById(voucherId);

      if (!voucher) {
        return res.status(404).json({ message: "Voucher tidak ditemukan" });
      }

      if (voucher.Qty <= 0) {
        return res.status(400).json({ message: "Voucher sudah habis" });
      }

      if (voucher.Voucher_status !== "enable") {
        return res.status(400).json({ message: "Voucher tidak aktif" });
      }

      // Hitung harga setelah diskon
      if (voucher.Persen_potongan) {
        hargaTotal = hargaTiket - (hargaTiket * voucher.Persen_potongan / 100);
      } else if (voucher.Harga_potongan) {
        hargaTotal = hargaTiket - voucher.Harga_potongan;
      }

      // Pastikan harga total tidak negatif
      hargaTotal = Math.max(hargaTotal, 0);

      // Kurangi qty voucher
      await ModulVoucher.findByIdAndUpdate(voucherId, { $inc: { Qty: -1 } });
    }

    // Buat pembayaran baru
    const pembayaranBaru = new ModulPembayaran({
      Modul_pembayaran_pic,
      userId: userId || null, // Simpan userId jika ada, null jika tidak ada
      pesananId,
      buktiTransaksiId: buktiTransaksiId || null, // Pastikan null jika tidak tersedia
      Harga_tiket: hargaTiket,
      Harga_total: hargaTotal,
      Metode: metode,
      transaksiId: transaksiId || null, // Pastikan null jika tidak tersedia
      Status: "Y",
      voucherId: voucherId || null, // Simpan ID voucher jika digunakan
    });

    await pembayaranBaru.save();

    // Hapus voucher dari userEksternal jika userId dan voucherId tersedia
if (userId && voucherId) {
  const updatedUser = await userEksternal.findOneAndUpdate(
    { _id: userId },
    { $pull: { voucher: { _id: new mongoose.Types.ObjectId(voucherId) } } }, // Pastikan voucherId dalam bentuk ObjectId
    { new: true } // Kembalikan data terbaru setelah update
  );

  if (updatedUser) {
    console.log(`Voucher ${voucherId} berhasil dihapus dari user ${userId}`);
    console.log("Data user setelah update:", updatedUser);
  } else {
    console.log(`Voucher ${voucherId} gagal dihapus atau user tidak ditemukan`);
  }
}


    res.status(201).json({ message: "Pembayaran berhasil!", data: pembayaranBaru });
  } catch (error) {
    console.error("Error saat membuat pembayaran:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};



const getAllPembayaran = async (req, res) => {
  try {
    const pembayaran = await ModulPembayaran.find()
      .populate("pesananId")  // Mengambil detail pesanan terkait
      .populate("userId", "nama email"); // Mengambil detail user tertentu (hanya nama & email)

    res.status(200).json({
      success: true,
      message: "Data pembayaran berhasil diambil",
      data: pembayaran
    });
  } catch (error) {
    console.error("❌ Error saat mengambil data pembayaran:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data pembayaran",
      error: error.message
    });
  }
};

// Mendapatkan pembayaran berdasarkan ID
const getPembayaranById = async (req, res) => {
  try {
    const pembayaran = await ModulPembayaran.findById(req.params.id)
      .populate("userId", "nama email") // Ambil nama & email user
      .populate("pesananId") // Ambil detail pesanan
      .populate("voucherId"); // Ambil detail voucher jika ada

    if (!pembayaran) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    res.status(200).json({ success: true, message: "Data pembayaran berhasil diambil", data: pembayaran });
  } catch (error) {
    console.error("❌ Error saat mengambil pembayaran:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server", error: error.message });
  }
};

const deletePembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari data pembayaran berdasarkan ID
    const pembayaran = await ModulPembayaran.findById(id);
    if (!pembayaran) {
      return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan" });
    }

    // Hapus pembayaran dari database
    await ModulPembayaran.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Pembayaran berhasil dihapus" });
  } catch (error) {
    console.error("❌ Error saat menghapus pembayaran:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat menghapus pembayaran", error: error.message });
  }
};

module.exports = {
  createPembayaran,
  createPembayaranMitra,
  getAllPembayaran,
  getPembayaranById,
  deletePembayaran
};
