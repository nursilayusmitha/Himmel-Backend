const express = require("express");
const router = express.Router();
const controller = require('../controllers/Modul_aduan.controller');

router.post('/create', controller.createAduan);
router.post('/percakapan', controller.createPercakapan);
router.get('/', controller.getAllAduan);
router.get('/:id', controller.getAduanById);
router.get('/user/:userId', controller.getAduanByUserId)
router.get('/percakapan/:id', controller.getPercakapanByAduanId);
router.get('/percakapan/cs/:userId', controller.getPercakapanCS);
router.put('/seen', controller.markAsSeen);
router.put('/status', controller.changeStatus);
router.put('/solusi', controller.addSolusi);
router.get('/status/:status', controller.getAduanByStatus);
router.get('/last-message/:userId', controller.getLastMessagesByChat);
router.get('/last-message-done/:userId', controller.getLastMessagesDone);
router.post('/create-percakapan', controller.createAduanWithPercakapan);




module.exports = router;
