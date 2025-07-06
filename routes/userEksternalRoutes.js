// userEksternalRoutes.js
const express = require("express");
const router = express.Router();
const userEksternalController = require("../controllers/userEksternalController");
const multer = require("multer");
// Define routes and map them to controller methods

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // cb(null, '../uploads/') // Destinasi diluar project api & front-end
        cb(null, './images/user_eksternal') // Destinasi didalam project front end
    },
    filename: function(req, file, cb) {
        // Rename the file to avoid conflicts
        cb(null, Date.now() + '-eksternal-' + file.originalname)
    }
});
const upload = multer({ storage: storage })

// GET ROUTER
router.get("/detail/:userId", userEksternalController.getUserById);
router.get("/", userEksternalController.getAllUsers);
router.get("/getUserByRole/:companyName/:userRole", userEksternalController.getUserByRole);
router.post("/getVoucherById/", userEksternalController.getVoucherById);

// POST ROUTER
router.post("/create", upload.any(), userEksternalController.createUser)
router.post("/createOne", userEksternalController.createUserOne);
router.post("/login", userEksternalController.loginUser);
router.post("/listByCompanyCode", userEksternalController.listByCompanyCode);

// PUT ROUTER
router.put("/updateOne/:userId", userEksternalController.updateUserOne);
router.put("/update/:_id", upload.any(), userEksternalController.updateUser)
// Add more routes as needed
// DELETE ROUTER
router.delete("/delete/:userId", userEksternalController.deleteUser);
router.delete("/block/:userId", userEksternalController.blockUser);

// Export the router
module.exports = router;
