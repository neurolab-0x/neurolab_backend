const { body, validationResult } = require('express-validator');
const Patient = require('../models/patientModel');

exports.createPatient = [
    body('name').isString().notEmpty(),
    body('age').isInt({ min: 0, max: 120 }),
    body('condition').isString().notEmpty(),
    body('brainActivityData').isJSON(),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, age, condition, brainActivityData } = req.body;
            const newPatient = new Patient({ name, age, condition, brainActivityData });
            const savedPatient = await newPatient.save();
            res.status(201).json(savedPatient);
        } catch (err) {
            console.error('Error saving patient data:', err);
            res.status(500).json({ message: err.message });
        }
    },
];



exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(patient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.updatePatient = async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json(updatedPatient);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createPatient = async (req, res) => {
    try {
        const { name, age, condition, brainActivityData } = req.body;
        const newPatient = new Patient({ name, age, condition, brainActivityData });
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (err) {
        console.error('Error saving patient data:', err);  // Log the error
        res.status(500).json({ message: err.message });
    }
};
