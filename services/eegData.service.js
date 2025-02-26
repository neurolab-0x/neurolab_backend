// services/eegData.service.js
const EEGData = require('../models/eegData.model');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');

const processEEGCSV = async (filePath, patientId, recordSetName) => {
  try {
    const eegDataRows = await parseCSV(filePath);
    const eegData = eegDataRows.map((row) => ({
      column: Number(row['column']),
      value: Number(row['value']),
    }));

    const newEEGData = new EEGData({ patientId, recordSetName, data: eegData });
    await newEEGData.save();

    
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Error processing EEG CSV:', err.message);
    throw new Error('EEG data processing failed');
  }
};

module.exports = { processEEGCSV };
