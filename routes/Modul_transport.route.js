const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/Modul_transport.controller");

// Routes
router.post("/create", create);
router.get("/", getAll);
router.get("/getPesawatAll", getPesawatAll);
router.get("/getKeretaAll", getKeretaAll);
router.get("/getPesawat", getPesawat);
router.get("/getKereta", getKereta);
router.get("/getById/:id", getById);
router.get("/getTransportById/:id", getTransportById);
router.put("/update/:id", update);
router.put("/updateOperasional/:id", updateOperasional);

module.exports = router;
