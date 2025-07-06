// companyController.js
require('dotenv').config();

// const createUtilitiesModel = require("../models/utilitiesModels");

// let Utilities 
// async function getUtilities() {
//     Utilities = await createUtilitiesModel();
// }  
// getUtilities()

const Utilities = require("../models/utilitiesModels");

const createUtilities = async (req, res) => {
  try {
    const { utilName, newData } = req.body;

    // Validasi input
    if (!utilName || !newData) {
      return res.status(400).json({ message: "utilName dan newData diperlukan" });
    }

    // Cari data berdasarkan utilName
    const utilities = await Utilities.findOne({ utilName });

    if (!utilities) {
      return res.status(404).json({ message: "Data utilities tidak ditemukan" });
    }

    // Tambahkan data baru ke dalam utilData
    utilities.utilData.push(newData);
    await utilities.save();

    res.status(200).json({ message: "Data berhasil ditambahkan", utilities });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// Controller method to get all users
async function getAllUtilities(req, res) {
  try {
    // Retrieve all users from the database
    const utilities = await Utilities.find({ isDeleted: false });
    res.json(utilities);
  } catch (error) {
    console.error("Error fetching utilities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to get all users
async function getUtilsByName(req, res) {
  try {
    const reqUtilName = req.params.utilName
    // Retrieve all users from the database
    const utilities = await Utilities.findOne({ isDeleted: false, utilName: reqUtilName });
    res.json(utilities);
  } catch (error) {
    console.error("Error fetching utilities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Export the controller methods
module.exports = {
  getAllUtilities,
  getUtilsByName,
  createUtilities
  // Add more controller methods as needed
};
