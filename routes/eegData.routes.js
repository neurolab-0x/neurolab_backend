const express = require('express');
const router = express.Router();
const eegDataController = require('../controllers/eegData.controller');
const upload = require('../config/multer.config')
const path = require("path");

router.post('/', eegDataController.createEEGData);
router.get('/patient/:patientId', eegDataController.getEEGDataByPatient);
router.delete('/:id', eegDataController.deleteEEGData);
router.post('/upload', upload.single('file'), eegDataController.uploadEEGData);

module.exports = router;
