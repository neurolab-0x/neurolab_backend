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

const doctorRouter = express.Router();

// Apply JWT verification and role check middleware to all routes
doctorRouter.use(verifyToken);
doctorRouter.use(checkRole('DOCTOR'));

// Profile routes
doctorRouter.get('/profile', getProfile);
doctorRouter.patch('/profile', updateProfile);

// Certification routes
doctorRouter.post('/certifications', addCertification);

// Patient management routes
doctorRouter.get('/patients', getPatients);
doctorRouter.post('/patients/assign', assignPatient);
doctorRouter.patch('/patients/:patientId/status', updatePatientStatus);

export default doctorRouter;