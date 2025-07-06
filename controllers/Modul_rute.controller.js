const Modul_rute = require('../models/Modul_rute.model');
const createRute = async (req, res) => {
  const { Modul_rute_pic, Jenis_kendaraan, Keberangkatan, Tujuan, Waktu_perjalanan, Harga_tiket } = req.body;

  // Validasi data jika diperlukan
  if (!Array.isArray(Keberangkatan) || !Array.isArray(Tujuan)) {
    return res.status(400).json({ message: "Keberangkatan dan Tujuan harus berupa array!" });
  }

  try {
    const rute = new Modul_rute({
      Modul_rute_pic,
      Jenis_kendaraan,
      Keberangkatan,
      Tujuan,
      Waktu_perjalanan,
      Harga_tiket,
    });

    await rute.save();
    res.status(201).json({ message: 'Rute created successfully!', rute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get all routes where Perbaikan is "N"
const getAllRute = async (req, res) => {
  try {
    const rute = await Modul_rute.find({ });
    res.status(200).json(rute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get routes for "pesawat"
const getRuteBandara = async (req, res) => {
  try {
    const rute = await Modul_rute.find({ Jenis_kendaraan: "pesawat", Perbaikan: "N" });
    res.status(200).json(rute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get routes for "kereta"
const getRuteStasiun = async (req, res) => {
  try {
    const rute = await Modul_rute.find({ Jenis_kendaraan: "kereta", Perbaikan: "N" });
    res.status(200).json(rute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get route by ID
const getRuteById = async (req, res) => {
  try {
    const rute = await Modul_rute.findById(req.params.id);
    if (rute.Perbaikan === "Y") {
      return res.status(404).json({ message: "Rute telah dihapus" });
    }
    res.status(200).json(rute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a route by ID
const updateRute = async (req, res) => {
  const { Modul_rute_pic, Jenis_kendaraan, Keberangkatan, Tujuan, Waktu_perjalanan, Harga_tiket } = req.body;

  try {
    const updatedRute = await Modul_rute.findByIdAndUpdate(req.params.id, {
      Modul_rute_pic,
      Jenis_kendaraan,
      Keberangkatan,
      Tujuan,
      Waktu_perjalanan,
      Harga_tiket,
    }, { new: true });

    res.status(200).json({ message: 'Rute updated successfully!', updatedRute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Ambil Harga Tiket berdasarkan ID Rute
const getHargaTiket = async (req, res) => {
  try {
      const { id } = req.params;
      console.log("Mencari Modul Rute dengan ID:", id);

      const modulRute = await Modul_rute.findById(id);
      
      if (!modulRute) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.status(200).json({ Harga_tiket: modulRute.Harga_tiket });
  } catch (error) {
      console.error("Error pada getHargaTiket:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Update Harga Tiket berdasarkan ID Rute
const updateHargaTiket = async (req, res) => {
  try {
      const { id } = req.params;
      const { Harga_tiket } = req.body;

      if (!Array.isArray(Harga_tiket) || Harga_tiket.length === 0) {
          return res.status(400).json({ message: "Harga tiket harus berupa array dan tidak boleh kosong" });
      }

      console.log("Mengupdate Harga Tiket untuk ID:", id, "Data:", Harga_tiket);

      const updatedRute = await Modul_rute.findByIdAndUpdate(
          id,
          { Harga_tiket },
          { new: true, runValidators: true }
      );

      if (!updatedRute) {
          return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.status(200).json({ message: "Harga tiket berhasil diperbarui", data: updatedRute.Harga_tiket });
  } catch (error) {
      console.error("Error pada updateHargaTiket:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};



// Soft delete a route by setting Perbaikan to "Y"
const perbaikanRute = async (req, res) => {
  try {
    const { Perbaikan } = req.body;
    const rute = await Modul_rute.findByIdAndUpdate(
      req.params.id,
      { Perbaikan },
      { new: true }
    );
    res.status(200).json({ message: 'Status perbaikan diperbarui!', rute });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createRute,
  getAllRute,
  getRuteBandara,
  getRuteStasiun,
  getRuteById,
  getHargaTiket,
  updateRute,
  updateHargaTiket,
  perbaikanRute,
};
