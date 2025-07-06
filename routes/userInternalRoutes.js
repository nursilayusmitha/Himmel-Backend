// userInternalRoutes.js
const express = require("express");
const router = express.Router();
const userInternalController = require("../controllers/userInternalController");
const multer = require("multer");
// Define routes and map them to controller methods

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // cb(null, '../uploads/') // Destinasi diluar project api & front-end
        cb(null, './images/user_internal') // Destinasi didalam project front end
    },
    filename: function(req, file, cb) {
        // Rename the file to avoid conflicts
        cb(null, Date.now() + '-Internal-' + file.originalname)
    }
});
const upload = multer({ storage: storage })

// GET ROUTER
router.get("/detail/:userId", userInternalController.getUserById);
router.get("/", userInternalController.getAllUsers);
router.get("/getUserByRole/:companyName/:userRole", userInternalController.getUserByRole);
router.get("/getUserByRequest", userInternalController.getUserByRequest);

// POST ROUTER
router.post("/create", upload.any(), userInternalController.createUser)
router.post("/createOne", userInternalController.createUserOne);
router.post("/login", userInternalController.loginUser);
router.post("/listByCompanyCode", userInternalController.listByCompanyCode);

// PUT ROUTER
router.put("/updateOne/:userId", userInternalController.updateUserOne);
router.put("/update/:_id", upload.any(), userInternalController.updateUser)
// Add more routes as needed
// DELETE ROUTER
router.delete("/delete/:userId", userInternalController.deleteUser);
router.delete("/block/:userId", userInternalController.blockUser);
router.delete("/accept/:userId", userInternalController.acceptUser);

// Export the router
module.exports = router;
