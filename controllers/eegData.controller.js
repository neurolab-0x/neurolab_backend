const { error } = require('console');
require("dotenv").config()
const EEGData = require('../models/eegData.model');
const { parseCSV } = require('../utils/csvParser');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require("mongodb")
const client = new MongoClient(process.env.MONGO_URI)
// const EEGData = require('../models/eegData.model')

const cloudinary = require('../config/cloudinary.config');
const { resolve } = require('url');
const { rejects } = require('assert');
const myDB = client.db("neurolab");
const NeuroColl = myDB.collection("neurolab-data");

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
  let uploadResult; // Declare outside try block for catch scope access

  try {
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "Please upload a CSV or TXT file" });
    }

    const patientId = req.body.patientId;
    const sanitizedPatientId = patientId.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    console.log("Uploading to Cloudinary...");
    const ext = path.extname(req.file.originalname) || ".tmp";

    // Upload to Cloudinary
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'eeg_data',
          public_id: `${sanitizedPatientId}_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`,
        },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    console.log("Upload result:", uploadResult);

  const newEEGData = new EEGData({
    patientId,
    dataUrl: uploadResult.secure_url,
    timestamp: uploadResult.created_at,
  });


  await newEEGData.save();
  console.log("ADDED TO DB SUCCESSFULLY!");

  res.status(201).json({
    message: "File uploaded and saved successfully",
    dataUrl: uploadResult.secure_url,
  });

  } catch (err) {
    if (uploadResult) {
      console.error("Upload succeeded but DB save failed:", err.message);
      res.status(500).json({ 
        message: "File uploaded to Cloudinary but failed to save record",
        cloudinaryUrl: uploadResult.secure_url,
        error: err.message
      });
    } else {
      console.error("Upload failed completely:", err.message);
      res.status(500).json({ 
        message: "Failed to upload file", 
        error: err.message 
      });
    }
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err.message);
        else console.log('Temporary file cleaned up');
      });
    }
  }
};

