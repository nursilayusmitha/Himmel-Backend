    const express = require("express");
    require("dotenv").config(); // Tambahkan ini untuk menggunakan .env
    const mongoose = require("mongoose");
    // Auth route 
    const Auth_route = require("./routes/Auth.route.js");

    // Modul 
    const Modul_transport = require("./routes/Modul_transport.route");
    const Modul_voucher = require("./routes/Modul_voucher.route");
    const Modul_rute = require("./routes/Modul_rute.route");
    const Modul_teknis = require("./routes/Modul_teknis.route");
    const Modul_pesanan = require("./routes/Modul_pesanan.route");
    const Modul_aduan = require("./routes/Modul_aduan.route");
    const Modul_chat = require("./routes/Modul_chat.route.js");

    const userInternal = require("./routes/userInternalRoutes.js");
    const userEksternal = require("./routes/userEksternalRoutes.js");
    const utilities = require("./routes/utilitiesRoutes.js");
    const role = require("./routes/roleRoutes.js");
    const cors = require("cors")
    const path = require("path");


    const app = express();

    // middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors())
    app.use('/images', express.static(path.join(__dirname, 'images'))); 

    // Auth Route 
    app.use("/api/Auth", Auth_route);
    // routes


    // Modul
    app.use("/api/Modul_transport", Modul_transport)
    app.use("/api/Modul_voucher", Modul_voucher)
    app.use("/api/Modul_rute", Modul_rute)
    app.use("/api/Modul_teknis", Modul_teknis)
    app.use("/api/Modul_pesanan", Modul_pesanan)
    app.use("/api/Modul_aduan", Modul_aduan)
    app.use("/api/Modul_chat", Modul_chat)

    // Tambahan
    app.use("/api/userInternal", userInternal)
    app.use("/api/userEksternal", userEksternal)
    app.use("/api/utilities", utilities)
    app.use("/api/role", role)

    const { checkAndUpdateExpiredVouchers } = require('./controllers/Modul_voucher.controller');
    const cron = require('node-cron');

    // Jalankan setiap 1 menit dengan node-cron
    cron.schedule('* * * * *', async () => {
      console.log('Memeriksa voucher yang expired...');
      try {
        await checkAndUpdateExpiredVouchers();
        console.log('Pemeriksaan selesai.');
      } catch (error) {
        console.error('Gagal memeriksa voucher:', error.message);
      }
    });

    















    app.get("/", (req, res) => {
        res.send("Hello from Node API Server Updated");
      });
      
      mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to database!");
    app.listen(4000, () => {
      console.log("Server is running on port 4000");
    });
  })
  .catch((error) => {
    console.log("Connection failed!", error);
  });
