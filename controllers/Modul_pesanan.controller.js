const ModulPesanan = require('../models/Modul_pesanan.model');
const ModulTeknis = require('../models/Modul_teknis.model');
const UserEksternal = require('../models/userEksternalModels');
const QRCode = require('qrcode');
const path = require("path");
const fs = require("fs");

const { parse } = require('json5');
const qr = require('qr-image');

const multer = require('multer');

// Multer configuration for storing QR Code images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/qrcodes');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.png');
  }
});

const upload = multer({ storage: storage });
// Create Pesanan
exports.createPesanan = async (req, res) => {
  try {
    const teknisId = req.params.id;
    const { Modul_pesanan_pic, userId, userName, userPhone, email, Kelas_kursi, Kode_kursi } = req.body;

    // 1. Get data from ModulTeknis by teknisId
    const modulTeknis = await ModulTeknis.findById(teknisId);
    if (!modulTeknis) {
      return res.status(404).json({ message: 'Modul Teknis tidak ditemukan.' });
    }

    const {
      Jenis_kendaraan,
      Nama_kendaraan,
      Nomor_kendaraan,
      Keberangkatan,
      Tujuan,
      Datetime_berangkat,
      Berangkat_date,
      Berangkat_time,
      Kursi_tersedia
    } = modulTeknis;

    // 2. If userId exists (external user), retrieve user data
    let userEksternalData = null;
    if (userId) {
      try {
        userEksternalData = await UserEksternal.findById(userId);
        if (!userEksternalData) {
          return res.status(404).json({ message: 'User tidak ditemukan.' });
        }
      } catch (err) {
        return res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data user.', error: err.message });
      }
    }

    const hargaTiketKelas = modulTeknis.Harga_tiket.find(harga => harga.label === Kelas_kursi);
    if (!hargaTiketKelas) {
      return res.status(400).json({ message: "Kelas kursi tidak valid." });
    }

    // Cek selectedKelas dan selectedSeat
    const selectedKelas = Kursi_tersedia.find(kursi => kursi.label === Kelas_kursi);
    if (!selectedKelas) {
      return res.status(400).json({ message: "Kelas kursi tidak valid." });
    }

    const selectedSeat = selectedKelas.seats.get(Kode_kursi);
    if (!selectedSeat) {
      return res.status(400).json({ message: "Kode kursi tidak valid." });
    }

    if (selectedSeat === "Y") {
      return res.status(400).json({ message: "Seat already booked." });
    }

    // Mark the seat as booked
    selectedKelas.seats.set(Kode_kursi, "Y");

    // Save the updated ModulTeknis with the seat marked as booked
    await modulTeknis.save();

    // 4. Create a new order (pesanan)
    const newPesanan = new ModulPesanan({
      Modul_pesanan_pic,
      userId: userEksternalData ? userEksternalData._id : null,
      teknisId: modulTeknis._id,
      userName: userEksternalData ? userEksternalData.userName : userName,
      userPhone: userEksternalData ? userEksternalData.userPhone : userPhone,
      email: userEksternalData ? userEksternalData.email : email,
      Jenis_kendaraan,
      Nama_kendaraan,
      Nomor_kendaraan,
      Keberangkatan,
      Tujuan,
      Datetime_berangkat,
      Berangkat_date,
      Berangkat_time,
      Kelas_kursi,
      Kode_kursi,
      Harga_tiket: hargaTiketKelas.harga,
      Status: "order",
      Verifikasi: "N"
    });

    // 5. Generate QR Code for the booking and save it as an image
    const qrCodePath = `./images/qrcodes/${newPesanan._id}.png`;
    try {
      await QRCode.toFile(qrCodePath, JSON.stringify({ pesananId: newPesanan._id, Kode_kursi, userName }));
    } catch (qrError) {
      return res.status(500).json({ message: 'Terjadi kesalahan saat membuat QR code.', error: qrError.message });
    }

    // Save QR Code path to newPesanan
    newPesanan.qrCode = qrCodePath;

    // Save the new order (pesanan)
    await newPesanan.save();

    // 6. Jika userId ada, tambahkan pesanan yang sama persis ke dalam data user eksternal
    if (userEksternalData) {
      userEksternalData.pesanan.push({
        pesananId: newPesanan._id,
        Modul_pesanan_pic,
        teknisId: modulTeknis._id,
        userName: newPesanan.userName,
        userPhone: newPesanan.userPhone,
        email: newPesanan.email,
        Jenis_kendaraan,
        Nama_kendaraan,
        Nomor_kendaraan,
        Keberangkatan,
        Tujuan,
        Datetime_berangkat,
        Berangkat_date,
        Berangkat_time,
        Kelas_kursi,
        Kode_kursi,
        Harga_tiket: newPesanan.Harga_tiket,
        Status: "order",
        Verifikasi: "N",
        qrCode: newPesanan.qrCode // Tambahkan QR Code ke data user eksternal
      });

      await userEksternalData.save();
    }

    res.status(201).json({
      message: 'Pesanan berhasil dibuat.',
      data: newPesanan
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
  }
};

exports.getPesananByUserId = async (req, res) => {
  try {
    const { userId } = req.body; // Ambil userId dari body request

    if (!userId) {
      return res.status(400).json({ message: 'UserId harus disertakan dalam body request.' });
    }

    // 1. Cari user eksternal berdasarkan userId
    const userEksternal = await UserEksternal.findById(userId);
    if (!userEksternal) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    // 2. Ambil semua pesananId dari array pesanan di user eksternal
    const pesananIds = userEksternal.pesanan.map(pesanan => pesanan.pesananId);

    if (pesananIds.length === 0) {
      return res.status(200).json({ message: 'User belum memiliki pesanan.', data: [] });
    }

    // 3. Ambil semua data pesanan yang sesuai dengan pesananIds dari ModulPesanan
    const pesananData = await ModulPesanan.find({ _id: { $in: pesananIds } });

    res.status(200).json({
      message: 'Pesanan berhasil diambil.',
      data: pesananData
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
  }
};



exports.getDetailPesanan = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari pesanan berdasarkan ID
    const pesanan = await ModulPesanan.findById(id).populate("teknisId").populate("userId");

    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Cek apakah QR Code ada
    let qrCodeUrl = null;
    if (pesanan.qrCode) {
      const qrPath = path.join(__dirname, "..", pesanan.qrCode);

      if (fs.existsSync(qrPath)) {
        qrCodeUrl = `${req.protocol}://${req.get("host")}/images/qrcodes/${path.basename(qrPath)}`;
      }
    }

    res.status(200).json({
      message: "Detail pesanan ditemukan.",
      data: {
        _id: pesanan._id,
        userName: pesanan.userName,
        userPhone: pesanan.userPhone,
        email: pesanan.email,
        Jenis_kendaraan: pesanan.Jenis_kendaraan,
        Nama_kendaraan: pesanan.Nama_kendaraan,
        Nomor_kendaraan: pesanan.Nomor_kendaraan,
        Keberangkatan: pesanan.Keberangkatan,
        Tujuan: pesanan.Tujuan,
        Kode_kursi: pesanan.Kode_kursi,
        Harga_tiket: pesanan.Harga_tiket,
        Datetime_berangkat: pesanan.Datetime_berangkat,
        Berangkat_date: pesanan.Berangkat_date,
        Berangkat_time: pesanan.Berangkat_time,
        Status: pesanan.Status,
        Verifikasi: pesanan.Verifikasi,
        qrCode: qrCodeUrl,
        createdAt: pesanan.createdAt,
        updatedAt: pesanan.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

// Ambil semua pesanan
exports.getAllPesanan = async (req, res) => {
  try {
    const pesanan = await ModulPesanan.find().populate("userId teknisId");
    res.status(200).json(pesanan);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan", error });
  }
};

// Ambil pesanan berdasarkan ID
exports.getPesananById = async (req, res) => {
  try {
    const { id } = req.params;
    const pesanan = await ModulPesanan.findById(id).populate("userId teknisId");
    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }
    res.status(200).json(pesanan);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan", error });
  }
};


exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari pesanan berdasarkan ID
    const pesanan = await ModulPesanan.findById(id);
    if (!pesanan) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Ambil data ModulTeknis berdasarkan teknisId dalam pesanan
    const modulTeknis = await ModulTeknis.findById(pesanan.teknisId);
    if (!modulTeknis) {
      return res.status(404).json({ message: "Modul Teknis tidak ditemukan" });
    }

    // Iterasi Kursi_tersedia untuk mencari kelas yang sesuai
    let kursiDitemukan = false;
    for (let kursi of modulTeknis.Kursi_tersedia) {
      if (kursi.seats.has(pesanan.Kode_kursi)) {
        kursi.seats.set(pesanan.Kode_kursi, "N");
        kursiDitemukan = true;
        break;
      }
    }

    if (!kursiDitemukan) {
      return res.status(400).json({ message: "Kelas kursi tidak valid atau kursi tidak ditemukan dalam sistem." });
    }

    // Simpan perubahan ke ModulTeknis
    await modulTeknis.save();

    // Update status pesanan menjadi "cancel"
    pesanan.Status = "cancel";
    await pesanan.save();

    res.status(200).json({ message: "Pesanan berhasil dibatalkan dan kursi dikembalikan.", pesanan });
  } catch (error) {
    res.status(500).json({ message: "Gagal membatalkan pesanan", error: error.message });
  }
};

// Scan QR Code and Update Verification Status
exports.scanQRCode = async (req, res) => {
  try {
      const { pesananId } = req.body;
      const pesanan = await ModulPesanan.findById(pesananId);

      if (!pesanan) {
          return res.status(404).json({ message: "Pesanan tidak ditemukan." });
      }

      if (pesanan.Status === "tiket"  && pesanan.Verifikasi === "N") {
          pesanan.Verifikasi = "Y";
          await pesanan.save();
          return res.status(200).json({ message: "Pesanan berhasil diverifikasi.", pesanan });
      }

      if (pesanan.Verifikasi = "Y") {
          return res.status(400).json({ message: "Tiket telah divalidasi sebelumnya." });
      }

      if (pesanan.Status === "cancel") {
          return res.status(400).json({ message: "Anda tidak memiliki hak tiket karena pesanan dibatalkan." });
      }

      res.status(400).json({ message: "Status pesanan tidak valid untuk verifikasi." });

  } catch (error) {
      res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};
