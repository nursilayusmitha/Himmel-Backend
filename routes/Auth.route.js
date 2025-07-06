const express = require("express");
const Auth = require("../models/Auth.model.js");
const app = express();


const router = express.Router();
const { RegisterAuth, LoginAuth, LogoutAuth,LogAuth,resetPasswordRequestController,resetPasswordController, resetPasswordRequestEksternalController, resetPasswordEksternalController } = require('../controllers/Auth.controller.js');


router.post("/register", RegisterAuth);
router.post("/login", LoginAuth);
router.post("/logout/:id", LogoutAuth);
router.put("/editlog/:id", LogAuth);
router.post("/requestResetPassword", resetPasswordRequestController);
router.post("/resetPassword", resetPasswordController);

router.post("/requestResetPasswordEksternal", resetPasswordRequestEksternalController);
router.post("/resetPasswordEksternal", resetPasswordEksternalController);



module.exports = router;