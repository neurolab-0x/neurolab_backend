const EEGData = require('../models/eegData.model');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

exports.createEEGData = async (req, res) => {
  try {
    const { patientId, recordSetName, data } = req.body;
    const newEEGData = new EEGData({ patientId, recordSetName, data });
    const savedEEGData = await newEEGData.save();
    res.status(201).json(savedEEGData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEEGDataByPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const eegData = await EEGData.find({ patientId });
    if (!eegData.length) {
      return res.status(404).json({ message: 'EEG data not found' });
    }
    res.status(200).json(eegData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEEGData = async (req, res) => {
  try {
    const eegData = await EEGData.findByIdAndDelete(req.params.id);
    if (!eegData) {
      return res.status(404).json({ message: 'EEG data not found' });
    }
    res.status(200).json({ message: 'EEG data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadCSV = async (req, res) => {
  const filePath = req.file.path;
  try {
    const eegDataRows = await parseCSV(filePath);
    const eegData = eegDataRows.map(row => ({
      column: Number(row['column']),
      value: Number(row['value']),
    }));

    const newEEGData = new EEGData({
      patientId: req.body.patientId,
      recordSetName: req.body.recordSetName,
      data: eegData,
    });

    await newEEGData.save();
    res.status(201).json({ message: 'EEG data uploaded and processed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'EEG data processing failed', error: err.message });
  } finally {
    fs.unlinkSync(filePath);
}
}