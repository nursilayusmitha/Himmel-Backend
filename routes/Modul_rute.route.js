const express = require("express");
const router = express.Router();
const {
  createRute,
  getAllRute,
  getRuteBandara,
  getRuteStasiun,
  getRuteById,
  updateRute,
  updateHargaTiket,
  perbaikanRute,
  getHargaTiket
} = require("../controllers/Modul_rute.controller");

// Routes
router.get("/", getAllRute);
router.get("/getHargaTiket/:id", getHargaTiket);
router.get("/getRuteById/:id", getRuteById);
router.get("/getRuteBandara/", getRuteBandara);
router.get("/getRuteStasiun/", getRuteStasiun);

router.post("/create", createRute);

router.put("/update/:id", updateRute);

router.put("/updateHarga/:id", updateHargaTiket);

router.put("/perbaikan/:id", perbaikanRute);

module.exports = router;
