const express = require("express");
const router = express.Router();
const {
  createVoucher,
  getAllVoucher,
  getVoucherById,
  getVoucherInternal,
  getVoucherEksternal,
  updateVoucher,
  updateStatusVoucher,
  deleteVoucher,
  claimVoucher
} = require("../controllers/Modul_voucher.controller");

// Routes
router.get("/", getAllVoucher);
router.get("/getVoucherById/:id", getVoucherById);
router.get("/getVoucherInternal/", getVoucherInternal);
router.get("/getVoucherEksternal/", getVoucherEksternal);

router.post("/create", createVoucher);
router.post("/claim/", claimVoucher);

router.put("/update/:id", updateVoucher);
router.put("/updateStatusVoucher/:id", updateStatusVoucher);

router.delete("/delete/:id", deleteVoucher);

module.exports = router;
