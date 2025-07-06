const express = require("express");
const router = express.Router();
const {
  createModulTeknis,
  getAllTeknis,
  getTeknisById,
  cancelTeknis,
  getKursi
} = require("../controllers/Modul_teknis.controller");
const {
  generateLaporan,
  generateGrowthCompareAllTimeBeforeToday,
  generateLaporanTahunan,
  getLaporanMingguanPerHari
} = require("../controllers/generate_laporan.controller");

// Routes
router.get("/", getAllTeknis);
router.get("/getTeknisById/:id", getTeknisById);
router.get("/getKursi/:id", getKursi);


router.post("/generateLaporan", generateLaporan);
router.post("/generateLaporanTahunan", generateLaporanTahunan);
router.post("/generateGrowthCompareAllTimeBeforeToday", generateGrowthCompareAllTimeBeforeToday);
router.get("/getLaporanMingguanPerHari", getLaporanMingguanPerHari);

router.post("/create", createModulTeknis);
router.put("/cancel/:id", cancelTeknis);

module.exports = router;
