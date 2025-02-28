const { error } = require('console');
const EEGData = require('../models/eegData.model');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');

const cloudinary = require('../config/cloudinary.config');

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
  try {
    if (!req.file){
      return res.status(400).json({ message: " File not found "});
    }
    
    const filePath = req.file.path;
    console.log(req.file);


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
    console.error('Error uploading csv: ', err.message )
    res.status(500).json({ message: 'EEG data processing failed', error: err.message });
  } finally {
    if (req.file && filePath){
      fs.unlink(filePath, (err)=> {
        if (err) console.error("error deleting file: ", err.message);
        else console.log("file deleted after processing");
      });

    }
    // fs.unlinkSync(filePath);
}


}

exports.uploadEEGData = async (req, res) => {
  try{
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a csv or txt file" });
    }

    const filePath = req.file.path;
    const patientId = req.body.patientId;

    console.log("uploading to cloudinary....");
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'eeg_data',
      public_id: `${patientId}_${Date.now()}`,
    });

    console.log("Upload result: ", uploadResult);

    const newEEGData = new eegData({
      patientId,
      dataUrl: uploadResult.secure_url,
    })

    await newEEGData.save();

    res.status(201).json({
      message: "file uploaded and saved successfully",
      dataUrl: uploadResult.secure_url,
    });

  } catch (err) {
    console.error("Error uploading eegData", err.message);
    res.status(500).json({ message: "error uploading eeg data", error: err.message });
  } finally {}
}