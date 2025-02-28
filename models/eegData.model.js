const mongoose = require('mongoose');

const EEGDataSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true,
    },
    dataUrl: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

const EEGData = mongoose.model('EEGData', EEGDataSchema);
module.exports = EEGData;
