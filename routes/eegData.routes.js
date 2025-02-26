const express = require('express');
const router = express.Router();
const eegDataController = require('../controllers/eegData.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', eegDataController.createEEGData);
router.get('/patient/:patientId', eegDataController.getEEGDataByPatient);
router.delete('/:id', eegDataController.deleteEEGData);
router.post('/upload-csv', upload.single('csvFile'), eegDataController.uploadCSV);

module.exports = router;
