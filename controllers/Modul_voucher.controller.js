const ModulVoucher = require('../models/Modul_voucher.model');
const UserEksternal = require('../models/userEksternalModels');
const crypto = require('crypto');

// Generate kode voucher unik
function generateUniqueCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 karakter hex
}

// Fungsi cek expired otomatis
async function checkAndUpdateExpiredVouchers() {
  const now = new Date();
  await ModulVoucher.updateMany(
    { Datetime_expired: { $lte: now }, Voucher_status: { $ne: 'expired' } },
    { $set: { Voucher_status: 'expired' } }
  );
}
// Create Voucher
exports.createVoucher = async (req, res) => {
  try {
    const { Persen_potongan, Harga_potongan, Datetime_expired } = req.body;
    
    // Cek apakah Persen_potongan dan Harga_potongan keduanya diisi
    if (Persen_potongan && Harga_potongan) {
      return res.status(400).json({ message: 'Pilih salah satu: persen atau harga potongan' });
    }

    // Pastikan kode unik
    let kodeVoucher;
    let isUnique = false;
    while (!isUnique) {
      kodeVoucher = generateUniqueCode();
      const existingVoucher = await ModulVoucher.findOne({ Kode_voucher: kodeVoucher });
      if (!existingVoucher) isUnique = true;
    }

    // Ubah string `Datetime_expired` menjadi objek Date
    const expiredDate = new Date(Datetime_expired);
    
    // Cek apakah `expiredDate` valid
    if (isNaN(expiredDate)) {
      return res.status(400).json({ message: 'Datetime_expired tidak valid' });
    }

    // Format untuk field Expired dalam 2 baris
    const formattedExpiredDate = `Tanggal : ${expiredDate.getDate()}-${expiredDate.getMonth() + 1}-${expiredDate.getFullYear()}`;
    const formattedExpiredTime = `Jam     : ${expiredDate.getHours().toString().padStart(2, '0')}:${expiredDate.getMinutes().toString().padStart(2, '0')}`;


    // Buat objek voucher baru
    const newVoucher = new ModulVoucher({
      ...req.body,
      Kode_voucher: kodeVoucher,
      Expired_date: formattedExpiredDate, // Set value Expired otomatis
      Expired_time: formattedExpiredTime, // Set value Expired otomatis
    });

    // Simpan voucher baru
    const savedVoucher = await newVoucher.save();

    // Kembalikan response dengan voucher yang berhasil dibuat
    res.status(201).json({
      message: 'Voucher berhasil dibuat',
      data: {
        ...savedVoucher._doc,
        Kode_voucher: savedVoucher.Kode_voucher,
        Expired_date: savedVoucher.Expired_date,
        Expired_time: savedVoucher.Expired_time,
      }
    });    
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat voucher', error: error.message });
  }
};


// Update Voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const existingVoucher = await ModulVoucher.findById(id);
    if (!existingVoucher) return res.status(404).json({ message: 'Voucher tidak ditemukan' });

    if (existingVoucher.Voucher_status === 'expired') {
      return res.status(400).json({ message: 'Voucher expired tidak dapat diperbarui' });
    }

    const { Kode_voucher, Persen_potongan, Harga_potongan } = req.body;
    if (Kode_voucher) {
      return res.status(400).json({ message: 'Kode voucher tidak dapat diubah' });
    }
    if (Persen_potongan && Harga_potongan) {
      return res.status(400).json({ message: 'Pilih salah satu: persen atau harga potongan' });
    }

    const updatedVoucher = await ModulVoucher.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: 'Voucher berhasil diperbarui', data: updatedVoucher });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui voucher', error: error.message });
  }
};

// Update Status Voucher (enable/disable)
exports.updateStatusVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await ModulVoucher.findById(id);
    if (!voucher) return res.status(404).json({ message: 'Voucher tidak ditemukan' });

    const newStatus = voucher.Voucher_status === 'enable' ? 'disable' : 'enable';
    voucher.Voucher_status = newStatus;
    await voucher.save();

    res.status(200).json({ message: `Status voucher diubah menjadi ${newStatus}`, data: voucher });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status voucher', error: error.message });
  }
};

// Get All Voucher
exports.getAllVoucher = async (req, res) => {
  try {
    const vouchers = await ModulVoucher.find({ isDeleted: 'N'  });
    res.status(200).json({ message: 'Daftar voucher', data: vouchers });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar voucher', error: error.message });
  }
};


// Get vouchers for 'semua' or 'internal' users where isDeleted is 'N' and status is 'enable'
exports.getVoucherInternal = async (req, res) => {
  try {
    const vouchers = await ModulVoucher.find({
      User_voucher: { $in: ['semua', 'internal'] },
      isDeleted: 'N',
      Voucher_status: 'enable',
    });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vouchers for 'semua' or 'eksternal' users where isDeleted is 'N' and status is 'enable'
exports.getVoucherEksternal = async (req, res) => {
  try {
    const vouchers = await ModulVoucher.find({
      User_voucher: { $in: ['semua', 'eksternal'] },
      isDeleted: 'N',
      Voucher_status: 'enable',
    });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get Voucher By ID
exports.getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await ModulVoucher.findById(id);
    if (!voucher || voucher.isDeleted === 'Y') {
      return res.status(404).json({ message: 'Voucher tidak ditemukan' });
    }
    res.status(200).json({ message: 'Detail voucher', data: voucher });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil voucher', error: error.message });
  }
};

// Delete Voucher (soft delete)
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await ModulVoucher.findByIdAndUpdate(id, { isDeleted: 'Y' }, { new: true });
    if (!voucher) return res.status(404).json({ message: 'Voucher tidak ditemukan' });

    res.status(200).json({ message: 'Voucher berhasil dihapus', data: voucher });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus voucher', error: error.message });
  }
};

exports.claimVoucher = async (req, res) => {
  try {
    const { userId, kodeVoucher } = req.body;

    // Cari voucher berdasarkan kodeVoucher
    const voucher = await ModulVoucher.findOne({ Kode_voucher: kodeVoucher, isDeleted: "N" });

    if (!voucher) {
      return res.status(404).json({ message: "Voucher tidak ditemukan" });
    }

    // Periksa apakah voucher masih tersedia
    if (voucher.Qty <= 0) {
      return res.status(400).json({ message: "Voucher sudah habis" });
    }

    // Periksa status voucher
    if (voucher.Voucher_status !== "enable") {
      return res.status(400).json({ message: "Voucher tidak aktif" });
    }

    // Periksa apakah voucher telah kedaluwarsa
    const now = new Date();
    if (new Date(voucher.Datetime_expired) < now) {
      return res.status(400).json({ message: "Voucher sudah kedaluwarsa" });
    }

    // Cari user eksternal
    const user = await UserEksternal.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Periksa apakah user eksternal diizinkan klaim voucher ini
    if (voucher.User_voucher !== "semua" && voucher.User_voucher !== "eksternal") {
      return res.status(400).json({ message: "Voucher ini tidak tersedia untuk user eksternal" });
    }

    // Periksa apakah user sudah pernah klaim voucher ini
    const alreadyClaimed = user.voucher.some(v => v.Kode_voucher === kodeVoucher);
    if (alreadyClaimed) {
      return res.status(400).json({ message: "Anda sudah klaim voucher ini" });
    }

    // Kurangi Qty voucher
    voucher.Qty -= 1;
    await voucher.save();

    // Tambahkan voucher ke user eksternal
    user.voucher.push({
      _id: voucher._id,
      Kode_voucher: voucher.Kode_voucher,
      Nama_voucher: voucher.Nama_voucher,
      Persen_potongan: voucher.Persen_potongan,
      Harga_potongan: voucher.Harga_potongan,
      Datetime_expired:voucher.Datetime_expired,
      Expired_date: voucher.Expired_date,
      Expired_time: voucher.Expired_time,
    });

    await user.save();

    res.status(200).json({ message: "Voucher berhasil diklaim", userVoucher: user.voucher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};


// Jalankan cek expired otomatis secara periodik (gunakan cron job di server utama)
setInterval(checkAndUpdateExpiredVouchers, 60000); // Periksa setiap 60 detik

// Tambahkan ini di paling bawah file controller
exports.checkAndUpdateExpiredVouchers = checkAndUpdateExpiredVouchers;
