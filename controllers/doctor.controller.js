import User from '../models/user.models.js';
import Doctor from '../models/doctor.models.js';

export const getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', '-password -refreshToken')
      .populate('patients.patientId', 'user');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      specialization,
      practiceAreas,
      availability,
      consultationFee,
      hospitalAffiliations,
      researchInterests
    } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          specialization,
          practiceAreas,
          availability,
          consultationFee,
          hospitalAffiliations,
          researchInterests
        }
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const addCertification = async (req, res) => {
  try {
    const { name, issuingBody, dateIssued, expiryDate } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          certifications: {
            name,
            issuingBody,
            dateIssued,
            expiryDate,
            status: 'active'
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      message: 'Certification added successfully',
      certification: doctor.certifications[doctor.certifications.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding certification', error: error.message });
  }
};

export const assignPatient = async (req, res) => {
  try {
    const { patientId } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      {
        $push: {
          patients: {
            patientId,
            assignedDate: new Date(),
            status: 'active'
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      message: 'Patient assigned successfully',
      patient: doctor.patients[doctor.patients.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning patient', error: error.message });
  }
};

export const updatePatientStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      {
        user: req.user._id,
        'patients.patientId': patientId
      },
      {
        $set: {
          'patients.$.status': status
        }
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient status updated successfully',
      patient: doctor.patients.find(p => p.patientId.toString() === patientId)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient status', error: error.message });
  }
};

export const getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate({
        path: 'patients.patientId',
        populate: {
          path: 'user',
          select: '-password -refreshToken'
        }
      });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({
      patients: doctor.patients
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients', error: error.message });
  }
}; 