const express = require("express");
const router = express.Router();
const {
  createPesanan,
  getAllPesanan,
  getPesananById,
  cancelOrder,
  getDetailPesanan,
  scanQRCode,
  getPesananByUserId
} = require("../controllers/Modul_pesanan.controller");
const {
  createPembayaran,
  createPembayaranMitra,
  getAllPembayaran,
  getPembayaranById,
  deletePembayaran
} = require("../controllers/Modul_pembayaran.controller");
const {
  createTransaksi,
  getAllTransaksi,
  getTransaksiById,
  getStrukTransaksi,
  getStrukPesanan
} = require("../controllers/Modul_transaksi.controller");


router.post("/create/:id", createPesanan);
router.post("/transaksi/:pembayaranId", createTransaksi);

router.post("/getPesananByUserId", getPesananByUserId);

router.get("/", getAllPesanan);
router.get("/transaksi/", getAllTransaksi);
router.get("/pesanan/:id", getDetailPesanan);
router.get("/getPesananById/:id", getPesananById);

router.get("/getPembayaranById/:id", getPembayaranById);

router.get("/getTransaksiById/:id", getTransaksiById);
router.get("/struk/:id", getStrukTransaksi);
router.get("/struk-order/:id", getStrukPesanan);


router.put("/cancelOrder/:id", cancelOrder);

router.post("/pembayaran/:pesananId", createPembayaran)
router.post("/pembayaran-mitra/:pesananId", createPembayaranMitra)
router.post("/scanqr", scanQRCode)
router.get("/pembayaran/", getAllPembayaran)


router.delete("/deletePembayaran/:id", deletePembayaran)


module.exports = router;
