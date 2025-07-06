const UserEksternal = require("../models/userEksternalModels");
const UserInternal = require("../models/userInternalModels");
const ModulTeknis = require("../models/Modul_teknis.model");
const ModulPesanan = require("../models/Modul_pesanan.model");
const ModulRute = require("../models/Modul_rute.model");
const ModulTransport = require("../models/Modul_transport.model");
const ModulPembayaran = require("../models/Modul_pembayaran.model");
const ModulTransaksi = require("../models/Modul_transaksi.model");
const getDateRange = (tipe, hari, minggu, bulan, tahun) => {
  const now = new Date();

  switch (tipe) {
    case "harian":
  if (!hari || !bulan || !tahun) return null;

  const y = parseInt(tahun);
  const m = parseInt(bulan) - 1; // bulan dimulai dari 0 (Januari = 0)
  const d = parseInt(hari);

  const dayStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
  return { startDate: dayStart, endDate: dayEnd };


    case "mingguan":
      if (!minggu || !bulan || !tahun) return null;
      const firstDay = new Date(`${tahun}-${bulan}-01T00:00:00.000Z`);
      const weekStart = new Date(firstDay);
      weekStart.setDate(firstDay.getDate() + (7 * (minggu - 1)));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { startDate: weekStart, endDate: weekEnd };

    case "bulanan":
      if (!bulan || !tahun) return null;
      return {
        startDate: new Date(`${tahun}-${bulan}-01T00:00:00.000Z`),
        endDate: new Date(`${tahun}-${bulan}-31T23:59:59.999Z`),
      };

    case "tahunan":
      if (!tahun) return null;
      return {
        startDate: new Date(`${tahun}-01-01T00:00:00.000Z`),
        endDate: new Date(`${tahun}-12-31T23:59:59.999Z`),
      };

    case "semua":
      return {
        startDate: new Date("2025-01-01T00:00:00.000Z"),
        endDate: now,
      };

    default:
      return null;
  }
};

const generateLaporan = async (req, res) => {
  try {
    const { tipe, hari, minggu, bulan, tahun } = req.body;
    const range = getDateRange(tipe, hari, minggu, bulan, tahun);

    if (!range) {
      return res.status(400).json({ message: "Parameter waktu tidak valid" });
    }

    const { startDate, endDate } = range;

     // ✅ Ambil semua data tanpa filter waktu
    const jumlahUserEksternalAll = await UserEksternal.countDocuments();
    const jumlahUserInternalAll = await UserInternal.countDocuments();
    const jumlahRuteAll = await ModulRute.countDocuments();
    const jumlahTransportAll = await ModulTransport.countDocuments();

    const jumlahUserEksternal = await UserEksternal.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const jumlahUserInternal = await UserInternal.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const jumlahRute = await ModulRute.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const jumlahTransport = await ModulTransport.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const jumlahTeknis = await ModulTeknis.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      Teknis: { $ne: "Cancel" },
    });

    const jumlahPesanan = await ModulPembayaran.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      Status: "selesai",
    });

    const tiketTerjualAgg = await ModulPembayaran.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalTiket: { $sum: "$Harga_tiket" } } },
    ]);
    const jumlahTiketTerjual = tiketTerjualAgg.length ? tiketTerjualAgg[0].totalTiket : 0;

    const pemasukanAgg = await ModulTransaksi.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, totalPemasukan: { $sum: "$Harga_tiket" } } },
    ]);
    const jumlahPemasukan = pemasukanAgg.length ? pemasukanAgg[0].totalPemasukan : 0;

    const jumlahDiskon = jumlahTiketTerjual - jumlahPemasukan;

    res.status(200).json({
      tipe,
      rentang: { startDate, endDate },
      jumlahUserEksternalAll,
      jumlahUserInternalAll,
      jumlahRuteAll,
      jumlahTransportAll,
      jumlahUserEksternal,
      jumlahRute,
      jumlahTransport,
      jumlahUserInternal,
      jumlahTeknis,
      jumlahPesanan,
      jumlahTiketTerjual,
      jumlahPemasukan,
      jumlahDiskon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil laporan" });
  }
};
const getCount = async (Model, range) => {
  return await Model.countDocuments({
    createdAt: {
      $gte: range.startDate,
      $lte: range.endDate,
    },
  });
};

const getSum = async (Model, range, field) => {
  const result = await Model.aggregate([
    {
      $match: {
        createdAt: {
          $gte: range.startDate,
          $lte: range.endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: `$${field}` },
      },
    },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

const generateGrowthCompareAllTimeBeforeToday = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const allTimeBeforeToday = {
      startDate: new Date("2000-01-01T00:00:00.000Z"),
      endDate: new Date(todayStart.getTime() - 1),
    };

    const todayRange = {
      startDate: todayStart,
      endDate: todayEnd,
    };

    const growthRate = (current, previous) => {
      if (previous === 0 && current > 0) return 100;
      if (previous === 0 && current === 0) return 0;
      return ((current / previous) * 100).toFixed(2);
    };

    // Hari ini
    const jumlahUserEksternalToday = await getCount(UserEksternal, todayRange);
    const jumlahTeknisToday = await ModulTeknis.countDocuments({
      createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate },
      Teknis: { $ne: "Cancel" },
    });
    const jumlahPesananToday = await ModulPembayaran.countDocuments({
      createdAt: { $gte: todayRange.startDate, $lte: todayRange.endDate },
      Status: "selesai",
    });
    const jumlahTiketTerjualToday = await getSum(ModulPembayaran, todayRange, "Harga_tiket");
    const jumlahPemasukanToday = await getSum(ModulTransaksi, todayRange, "Harga_tiket");
    const jumlahDiskonToday = jumlahTiketTerjualToday - jumlahPemasukanToday;

    // All time hingga kemarin
    const jumlahUserEksternalBefore = await getCount(UserEksternal, allTimeBeforeToday);
    const jumlahTeknisBefore = await ModulTeknis.countDocuments({
      createdAt: { $gte: allTimeBeforeToday.startDate, $lte: allTimeBeforeToday.endDate },
      Teknis: { $ne: "Cancel" },
    });
    const jumlahPesananBefore = await ModulPembayaran.countDocuments({
      createdAt: { $gte: allTimeBeforeToday.startDate, $lte: allTimeBeforeToday.endDate },
      Status: "selesai",
    });
    const jumlahTiketTerjualBefore = await getSum(ModulPembayaran, allTimeBeforeToday, "Harga_tiket");
    const jumlahPemasukanBefore = await getSum(ModulTransaksi, allTimeBeforeToday, "Harga_tiket");
    const jumlahDiskonBefore = jumlahTiketTerjualBefore - jumlahPemasukanBefore;

    res.status(200).json({
      hariIni: {
        startDate: todayRange.startDate,
        endDate: todayRange.endDate,
        jumlahUserEksternal: jumlahUserEksternalToday,
        jumlahTeknis: jumlahTeknisToday,
        jumlahPesanan: jumlahPesananToday,
        jumlahTiketTerjual: jumlahTiketTerjualToday,
        jumlahPemasukan: jumlahPemasukanToday,
        jumlahDiskon: jumlahDiskonToday,
      },
      growthRateComparedToAllTimeBeforeToday: {
        jumlahUserEksternal: parseFloat(growthRate(jumlahUserEksternalToday, jumlahUserEksternalBefore)),
        jumlahTeknis: parseFloat(growthRate(jumlahTeknisToday, jumlahTeknisBefore)),
        jumlahPesanan: parseFloat(growthRate(jumlahPesananToday, jumlahPesananBefore)),
        jumlahTiketTerjual: parseFloat(growthRate(jumlahTiketTerjualToday, jumlahTiketTerjualBefore)),
        jumlahPemasukan: parseFloat(growthRate(jumlahPemasukanToday, jumlahPemasukanBefore)),
        jumlahDiskon: parseFloat(growthRate(jumlahDiskonToday, jumlahDiskonBefore)),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil laporan growth terhadap all-time sebelum hari ini" });
  }
};

function formatRange(startDate, endDate) {
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  return `${formatDate(startDate)}-${formatDate(endDate)}`;
}

const generateLaporanTahunan = async (req, res) => {
  try {
    const now = new Date();
const endDate = new Date(now.setHours(23, 59, 59, 999));
const startDate = new Date(endDate);
startDate.setFullYear(startDate.getFullYear() - 1);
startDate.setHours(0, 0, 0, 0);



    const laporanHarian = [];
    const laporanMingguan = [];
    const laporanBulanan = [];

    // === HARIAN (30 hari terakhir) ===
    let dailyStart = new Date(endDate);
    dailyStart.setDate(endDate.getDate() - 29);
    let currentDay = new Date(dailyStart);
while (currentDay <= endDate) {
  const nextDay = new Date(currentDay);
  nextDay.setDate(currentDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0); // <== ini wajib


      const [jumlahUserEksternal, jumlahTeknis, jumlahPesanan, tiketTerjualAgg, pemasukanAgg] = await Promise.all([
        UserEksternal.countDocuments({ createdAt: { $gte: currentDay, $lt: nextDay } }),
        ModulTeknis.countDocuments({ createdAt: { $gte: currentDay, $lt: nextDay }, Teknis: { $ne: "Cancel" } }),
        ModulPembayaran.countDocuments({ createdAt: { $gte: currentDay, $lt: nextDay }, Status: "selesai" }),
        ModulPembayaran.aggregate([
          { $match: { createdAt: { $gte: currentDay, $lt: nextDay } } },
          { $group: { _id: null, totalTiket: { $sum: "$Harga_tiket" } } }
        ]),
        ModulTransaksi.aggregate([
          { $match: { createdAt: { $gte: currentDay, $lt: nextDay } } },
          { $group: { _id: null, totalPemasukan: { $sum: "$Harga_tiket" } } }
        ])
      ]);

      const totalTiket = tiketTerjualAgg[0]?.totalTiket || 0;
      const totalPemasukan = pemasukanAgg[0]?.totalPemasukan || 0;

      laporanHarian.push({
        tanggal: currentDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        jumlahUserEksternal,
        jumlahTeknis,
        jumlahPesanan,
        jumlahTiketTerjual: totalTiket,
        jumlahPemasukan: totalPemasukan,
        jumlahDiskon: totalTiket - totalPemasukan
      });

      currentDay = nextDay;
    }

    // === MINGGUAN (4 minggu terakhir) ===
    let mingguIter = new Date(endDate);
mingguIter.setDate(mingguIter.getDate() - mingguIter.getDay()); // hari Minggu
mingguIter.setHours(0, 0, 0, 0);


    for (let i = 0; i < 4; i++) {
      const mingguAwal = new Date(mingguIter);
      mingguAwal.setDate(mingguIter.getDate() - (7 * i));
      const mingguAkhir = new Date(mingguAwal);
      mingguAkhir.setDate(mingguAwal.getDate() + 6);
      mingguAkhir.setHours(23, 59, 59, 999);

      const [jumlahUserEksternal, jumlahTeknis, jumlahPesanan, tiketTerjualAgg, pemasukanAgg] = await Promise.all([
        UserEksternal.countDocuments({ createdAt: { $gte: mingguAwal, $lte: mingguAkhir } }),
        ModulTeknis.countDocuments({ createdAt: { $gte: mingguAwal, $lte: mingguAkhir }, Teknis: { $ne: "Cancel" } }),
        ModulPembayaran.countDocuments({ createdAt: { $gte: mingguAwal, $lte: mingguAkhir }, Status: "selesai" }),
        ModulPembayaran.aggregate([
          { $match: { createdAt: { $gte: mingguAwal, $lte: mingguAkhir } } },
          { $group: { _id: null, totalTiket: { $sum: "$Harga_tiket" } } }
        ]),
        ModulTransaksi.aggregate([
          { $match: { createdAt: { $gte: mingguAwal, $lte: mingguAkhir } } },
          { $group: { _id: null, totalPemasukan: { $sum: "$Harga_tiket" } } }
        ])
      ]);

      const totalTiket = tiketTerjualAgg[0]?.totalTiket || 0;
      const totalPemasukan = pemasukanAgg[0]?.totalPemasukan || 0;

      laporanMingguan.unshift({ // urutan dari minggu lalu ke minggu ini
        label: `${mingguAwal.getDate()} ${mingguAwal.toLocaleString('default', { month: 'short' })} - ${mingguAkhir.getDate()} ${mingguAkhir.toLocaleString('default', { month: 'short' })}`,
        jumlahUserEksternal,
        jumlahTeknis,
        jumlahPesanan,
        jumlahTiketTerjual: totalTiket,
        jumlahPemasukan: totalPemasukan,
        jumlahDiskon: totalTiket - totalPemasukan
      });
    }

    // === BULANAN (12 bulan terakhir tanpa bulan pertama) ===
    let bulanIter = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1); // Lewati bulan pertama
    while (bulanIter <= endDate) {
      const bulanAwal = new Date(bulanIter);
      const bulanAkhir = new Date(bulanIter.getFullYear(), bulanIter.getMonth() + 1, 0, 23, 59, 59, 999);

      const [jumlahUserEksternal, jumlahTeknis, jumlahPesanan, tiketTerjualAgg, pemasukanAgg] = await Promise.all([
        UserEksternal.countDocuments({ createdAt: { $gte: bulanAwal, $lte: bulanAkhir } }),
        ModulTeknis.countDocuments({ createdAt: { $gte: bulanAwal, $lte: bulanAkhir }, Teknis: { $ne: "Cancel" } }),
        ModulPembayaran.countDocuments({ createdAt: { $gte: bulanAwal, $lte: bulanAkhir }, Status: "selesai" }),
        ModulPembayaran.aggregate([
          { $match: { createdAt: { $gte: bulanAwal, $lte: bulanAkhir } } },
          { $group: { _id: null, totalTiket: { $sum: "$Harga_tiket" } } }
        ]),
        ModulTransaksi.aggregate([
          { $match: { createdAt: { $gte: bulanAwal, $lte: bulanAkhir } } },
          { $group: { _id: null, totalPemasukan: { $sum: "$Harga_tiket" } } }
        ])
      ]);

      const totalTiket = tiketTerjualAgg[0]?.totalTiket || 0;
      const totalPemasukan = pemasukanAgg[0]?.totalPemasukan || 0;

      laporanBulanan.push({
        bulan: bulanAwal.toLocaleString('default', { month: 'short' }),
        jumlahUserEksternal,
        jumlahTeknis,
        jumlahPesanan,
        jumlahTiketTerjual: totalTiket,
        jumlahPemasukan: totalPemasukan,
        jumlahDiskon: totalTiket - totalPemasukan
      });

      bulanIter.setMonth(bulanIter.getMonth() + 1);
    }

    const rentangHarianStart = new Date(endDate);
rentangHarianStart.setDate(endDate.getDate() - 29);
rentangHarianStart.setHours(0, 0, 0, 0);

const rentangMingguanStart = new Date(endDate);
rentangMingguanStart.setDate(rentangMingguanStart.getDate() - rentangMingguanStart.getDay() - 21); // 3 minggu lalu dari awal minggu

const rentangBulananStart = new Date(startDate); // Sudah setel setahun lalu + 1 hari

const rentangFormatted = {
  harian: formatRange(rentangHarianStart, endDate),
  mingguan: formatRange(rentangMingguanStart, endDate),
  bulanan: formatRange(rentangBulananStart, endDate),
};


    res.status(200).json({
  rentang: {
    startDate,
    endDate,
    formatted: rentangFormatted
  },
  harian: laporanHarian,
  mingguan: laporanMingguan,
  bulanan: laporanBulanan
});


  } catch (error) {
    console.error("Gagal generate laporan tahunan:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat generate laporan tahunan" });
  }
};

const { startOfWeek, endOfWeek, subWeeks, addDays, format } = require('date-fns')
const idLocale = require('date-fns/locale/id').default

const getLaporanMingguanPerHari = async (req, res) => {
  try {
    const today = new Date()

    const startThisWeek = startOfWeek(today, { weekStartsOn: 0 }) // Minggu
    const endThisWeek = endOfWeek(today, { weekStartsOn: 0 })     // Sabtu

    const startLastWeek = subWeeks(startThisWeek, 1)
    const endLastWeek = subWeeks(endThisWeek, 1)

    const fetchDataPerHari = async (startDate) => {
      const result = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i)
        const start = new Date(date.setHours(0, 0, 0, 0))
        const end = new Date(date.setHours(23, 59, 59, 999))

        const jumlahUserEksternal = await UserEksternal.countDocuments({
          createdAt: { $gte: start, $lte: end }
        })

        const jumlahTeknis = await ModulTeknis.countDocuments({
          createdAt: { $gte: start, $lte: end },
          Teknis: { $ne: 'Cancel' }
        })

        const jumlahPesanan = await ModulPembayaran.countDocuments({
          createdAt: { $gte: start, $lte: end },
          Status: 'selesai'
        })

        const tiketTerjualAgg = await ModulPembayaran.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, totalTiket: { $sum: '$Harga_tiket' } } }
        ])
        const jumlahTiketTerjual = tiketTerjualAgg.length ? tiketTerjualAgg[0].totalTiket : 0

        const pemasukanAgg = await ModulTransaksi.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, totalPemasukan: { $sum: '$Harga_tiket' } } }
        ])
        const jumlahPemasukan = pemasukanAgg.length ? pemasukanAgg[0].totalPemasukan : 0

        const jumlahDiskon = jumlahTiketTerjual - jumlahPemasukan

        result.push({
          tanggal: format(start, 'dd/MM', { locale: idLocale }),
          jumlahUserEksternal,
          jumlahTeknis,
          jumlahPesanan,
          jumlahTiketTerjual,
          jumlahPemasukan,
          jumlahDiskon
        })
      }

      return result
    }

    const mingguIni = await fetchDataPerHari(startThisWeek)
    const mingguLalu = await fetchDataPerHari(startLastWeek)

    res.status(200).json({
      mingguIni,
      mingguLalu
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil laporan mingguan' })
  }
}


module.exports = { generateLaporan, generateGrowthCompareAllTimeBeforeToday, generateLaporanTahunan, getLaporanMingguanPerHari };
