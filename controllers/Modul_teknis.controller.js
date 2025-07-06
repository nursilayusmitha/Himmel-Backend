const cron = require('node-cron');
const moment = require('moment');
const ModulTeknis = require('../models/Modul_teknis.model');
const ModulTransport = require('../models/Modul_transport.model');
const ModulRute = require('../models/Modul_rute.model');

// Utility function to generate seat labels
const generateSeats = (label, qty) => {
  let seats = {};
  let prefix = label === 'Economy' ? 'C' : label === 'Business' ? 'B' : 'A';
  for (let i = 1; i <= qty; i++) {
    let seatNumber = `${prefix}${i.toString().padStart(3, '0')}`;
    seats[seatNumber] = 'N'; // 'N' for not occupied
  }
  return seats;
};

exports.createModulTeknis = async (req, res) => {
  try {
    const {
      Modul_teknis_pic, transportId, ruteId, Datetime_berangkat
    } = req.body;

    // Validate required fields
    if (!Modul_teknis_pic || !transportId || !ruteId || !Datetime_berangkat) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // Fetch transport and route details
    const transport = await ModulTransport.findById(transportId);
    if (!transport) return res.status(404).json({ message: "Transport not found." });

    const rute = await ModulRute.findById(ruteId);
    if (!rute) return res.status(404).json({ message: "Route not found." });

    // Populate fields from transport and route
    const { Jenis_kendaraan, Nama_kendaraan, Kapasitas_penumpang, Fasilitas } = transport;
    const { Keberangkatan, Tujuan, Waktu_perjalanan } = rute;

    // Calculate Harga_tiket
    const Harga_tiket = rute.Harga_tiket.map(harga => ({
      label: harga.label,
      harga: harga.harga 
    }));

    // Generate Kursi_tersedia
    const Kursi_tersedia = transport.Harga_kursi.map(seat => ({
      label: seat.label,
      seats: generateSeats(seat.label, seat.qty)
    }));

    const datetimeBerangkat = new Date(req.body.Datetime_berangkat);
    // Tambahkan offset UTC+7
    datetimeBerangkat.setHours(datetimeBerangkat.getHours() - 7);
    
    // Ubah string `Datetime_berangkat` menjadi objek Date
    const berangkatDate = new Date(Datetime_berangkat);
    
    // Cek apakah `berangkatDate` valid
    if (isNaN(berangkatDate)) {
      return res.status(400).json({ message: 'Datetime_berangkat tidak valid' });
    }

    // Format untuk field Berangkat dalam 2 baris
    const formattedBerangkatDate = `Tanggal : ${berangkatDate.getDate()}-${berangkatDate.getMonth() + 1}-${berangkatDate.getFullYear()}`;
    const formattedBerangkatTime = `Jam     : ${berangkatDate.getHours().toString().padStart(2, '0')}:${berangkatDate.getMinutes().toString().padStart(2, '0')}`;
    
    // Create Modul Teknis
    const newModulTeknis = new ModulTeknis({
      Modul_teknis_pic, transportId, ruteId,
      Jenis_kendaraan, Nama_kendaraan,
      Nomor_kendaraan: transport.Nomor_kendaraan,
      Fasilitas, Kapasitas_penumpang,
      Keberangkatan, Tujuan,
      Waktu_perjalanan, Harga_tiket,
      Kursi_tersedia, Datetime_berangkat,
      Berangkat_date: formattedBerangkatDate, // Set value Berangkat otomatis
      Berangkat_time: formattedBerangkatTime, // Set value Berangkat otomatis
    });

    // Simpan data Modul Teknis
    await newModulTeknis.save();

    // Update status transport menjadi 'N' (Belum Jalan)
    await ModulTransport.findByIdAndUpdate(transportId, { Status: 'N' });

    // Jadwal otomatis perubahan status perjalanan
    scheduleTeknisCountdown(newModulTeknis._id, Datetime_berangkat, Waktu_perjalanan);

    res.status(201).json({
      message: "Modul Teknis created successfully",
      data: newModulTeknis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Scheduler Countdown
const scheduleTeknisCountdown = (teknisId, datetimeBerangkat, waktuPerjalanan) => {
  cron.schedule('*/1 * * * *', async () => {  // Run every minute
    try {
      const modul = await ModulTeknis.findById(teknisId);
      if (!modul) return;

      const waktuBerangkat = moment(datetimeBerangkat);
      const waktuSelesai = moment(waktuBerangkat).add(waktuPerjalanan, 'minutes');
      const now = moment();

      // Jika sudah waktunya berangkat
      if (now.isAfter(waktuBerangkat) && modul.Teknis === "Proses") {
        await ModulTeknis.findByIdAndUpdate(teknisId, { Teknis: "Jalan" });
        console.log(`Teknis ${teknisId} mulai perjalanan ("Jalan").`);
      }

      // Jika sudah waktunya selesai
      if (now.isAfter(waktuSelesai) && modul.Teknis === "Jalan") {
        await ModulTeknis.findByIdAndUpdate(teknisId, { Teknis: "Selesai" });
        await ModulTransport.findByIdAndUpdate(modul.transportId, { Status: 'Y' });
        console.log(`Teknis ${teknisId} selesai perjalanan ("Selesai"), transport status diupdate ke "Y".`);
      }

    } catch (error) {
      console.error(`Error in countdown scheduler for Teknis ${teknisId}:`, error);
    }
  });
};

// Get All Teknis
exports.getAllTeknis = async (req, res) => {
  try {
    const teknisList = await ModulTeknis.find().populate('transportId ruteId');
    res.status(200).json(teknisList);
  } catch (error) {
    console.error('Error fetching all teknis:', error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getKursi = async (req, res) => {
  try {
    const { id } = req.params;

    // Find ModulTeknis by id
    const modulTeknis = await ModulTeknis.findById(id);

    if (!modulTeknis) {
      return res.status(404).json({ message: "Modul Teknis not found." });
    }

    // Extract Kursi_tersedia from the Modul Teknis
    const { Kursi_tersedia } = modulTeknis;

    res.status(200).json({
      message: "Kursi tersedia retrieved successfully.",
      data: Kursi_tersedia,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


// Get Teknis By ID
exports.getTeknisById = async (req, res) => {
  try {
    const { id } = req.params;
    const teknis = await ModulTeknis.findById(id).populate('transportId ruteId');
    if (!teknis) return res.status(404).json({ message: "Teknis not found" });
    res.status(200).json(teknis);
  } catch (error) {
    console.error('Error fetching teknis by ID:', error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.cancelTeknis = async (req, res) => {
  try {
    const { Teknis } = req.body;

    // Cari data teknis berdasarkan ID
    const teknis = await ModulTeknis.findById(req.params.id);
    if (!teknis) {
      return res.status(404).json({ message: "Data teknis tidak ditemukan!" });
    }

    // Ambil transportId dari teknis
    const transportId = teknis.transportId;
    
    // Perbarui status teknis
    teknis.Teknis = Teknis;
    await teknis.save();

    // Jika transportId valid, ubah status transport menjadi "Y"
    if (transportId) {
      await ModulTransport.findByIdAndUpdate(transportId, { Status: "Y" });
    }

    res.status(200).json({ message: "Status teknis & transport diperbarui!", teknis });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



