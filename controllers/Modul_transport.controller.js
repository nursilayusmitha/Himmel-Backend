const Modul_transport = require('../models/Modul_transport.model');

// Create a new transport
const create = async (req, res) => {
  const {
    Modul_transport_pic,
    Jenis_kendaraan,
    Nama_kendaraan,
    Nomor_kendaraan,
    Tanggal_pembuatan,
    Kapasitas_penumpang,
    Harga_kursi,
    Fasilitas,
    Status,
    Status_operasional,
    Operator_kendaraan,
  } = req.body;

  try {
    const newTransport = new Modul_transport({
      Modul_transport_pic,
      Jenis_kendaraan,
      Nama_kendaraan,
      Nomor_kendaraan,
      Tanggal_pembuatan,
      Kapasitas_penumpang,
      Harga_kursi,
      Fasilitas,
      Status,
      Status_operasional,
      Operator_kendaraan,
    });

    await newTransport.save();
    res.status(201).json({
      message: 'Transport created successfully!',
      transport: newTransport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get all transport data
const getAll = async (req, res) => {
  try {
    const transports = await Modul_transport.find();
    res.status(200).json({
      message: 'All transport data retrieved successfully!',
      transports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get transport data with "Pesawat" as vehicle type, operational status "enable", and general status "Y"
const getPesawatAll = async (req, res) => {
  try {
    const pesawat = await Modul_transport.find({
      Jenis_kendaraan: 'pesawat',
    });
    res.status(200).json({
      message: 'Pesawat data retrieved successfully!',
      pesawat,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getPesawat = async (req, res) => {
  try {
    const pesawat = await Modul_transport.find({
      Jenis_kendaraan: 'pesawat',
      Status_operasional: 'enable',
      Status: 'Y',
    });
    res.status(200).json({
      message: 'Pesawat data retrieved successfully!',
      pesawat,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getKeretaAll = async (req, res) => {
  try {
    const kereta = await Modul_transport.find({
      Jenis_kendaraan: 'kereta',
    });
    res.status(200).json({
      message: 'Kereta data retrieved successfully!',
      kereta,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get transport data with "Kereta" as vehicle type, operational status "enable", and general status "Y"
const getKereta = async (req, res) => {
  try {
    const kereta = await Modul_transport.find({
      Jenis_kendaraan: 'kereta',
      Status_operasional: 'enable',
      Status: 'Y',
    });
    res.status(200).json({
      message: 'Kereta data retrieved successfully!',
      kereta,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get transport data by ID
const getById = async (req, res) => {
  const { id } = req.params;
  try {
    const transport = await Modul_transport.findById(id);
    if (!transport) {
      return res.status(404).json({
        message: 'Transport not found.',
      });
    }
    res.status(200).json({
      message: 'Transport data retrieved successfully!',
      transport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get getTransportById by ID
const getTransportById = async (req, res) => {
  try {
    const transport = await Modul_transport.findById(req.params.id);
    if (transport.Status === "N") {
      return res.status(404).json({ message: "Masih diperjalanan atau tidak tersedia" });
    }
    res.status(200).json(transport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update transport data
const update = async (req, res) => {
  const { id } = req.params;
  const {
    Modul_transport_pic,
    Jenis_kendaraan,
    Nama_kendaraan,
    Nomor_kendaraan,
    Tanggal_pembuatan,
    Kapasitas_penumpang,
    Harga_kursi,
    Fasilitas,
    Status,
    Status_operasional,
    Operator_kendaraan,
  } = req.body;

  try {
    const updatedTransport = await Modul_transport.findByIdAndUpdate(
      id,
      {
        Modul_transport_pic,
        Jenis_kendaraan,
        Nama_kendaraan,
        Nomor_kendaraan,
        Tanggal_pembuatan,
        Kapasitas_penumpang,
        Harga_kursi,
        Fasilitas,
        Status,
        Status_operasional,
        Operator_kendaraan,
      },
      { new: true }
    );

    if (!updatedTransport) {
      return res.status(404).json({
        message: 'Transport not found.',
      });
    }

    res.status(200).json({
      message: 'Transport updated successfully!',
      transport: updatedTransport,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update operational status of transport (enable/disable)
const updateOperasional = async (req, res) => {
  try {
    const { Status_operasional } = req.body;
    const transport = await Modul_transport.findByIdAndUpdate(
      req.params.id,
      { Status_operasional },
      { new: true }
    );
    res.status(200).json({ message: 'Status operasional diperbarui!', transport });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  getPesawatAll,
  getKeretaAll,
  getPesawat,
  getKereta,
  getById,
  update,
  updateOperasional,
  getTransportById
};
