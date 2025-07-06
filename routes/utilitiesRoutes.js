// userInternalRoutes.js
const express = require("express");
const router = express.Router();
const utilitiesConntroller = require("../controllers/utilitiesController");

// Define routes and map them to controller methods

// GET ROUTER
router.get("/", utilitiesConntroller.getAllUtilities);
router.get("/byName/:utilName", utilitiesConntroller.getUtilsByName);


// POST ROUTER
router.post("/create/", utilitiesConntroller.createUtilities);

// PUT ROUTER

// Add more routes as needed

module.exports = router;
