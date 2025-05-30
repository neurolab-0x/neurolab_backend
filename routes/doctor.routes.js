import express from 'express';
import {
  getProfile,
  updateProfile,
  addCertification,
  assignPatient,
  updatePatientStatus,
  getPatients
} from '../controllers/doctor.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Apply JWT verification and role check middleware to all routes
router.use(verifyToken);
router.use(checkRole('doctor'));

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// Certification routes
router.post('/certifications', addCertification);

// Patient management routes
router.get('/patients', getPatients);
router.post('/patients/assign', assignPatient);
router.patch('/patients/:patientId/status', updatePatientStatus);

export default router; 