const express = require('express');
const passport = require('passport');

const PatientsService = require('../services/patientsService');
const validatorHandler = require('../middlewares/validatorHandler');
const { checkRoles } = require('../middlewares/authHandler');
const {
  createUserSchema,
} = require('../schemas/userSchema');
const {
  createPersonSchema
} = require('../schemas/personSchema');
const {
  createPatientSchema,
  createPatientWithPersonSchema,
  updateConsentsSchema,
  getPatientSchema,
  updatePatientSchema
} = require('../schemas/patientSchema');


const router = express.Router();
const service = new PatientsService();

// register all new patient
router.post('/register-all-new',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(createUserSchema, 'body.user'),
  validatorHandler(createPersonSchema, 'body.person'),
  validatorHandler(createPatientSchema, 'body.patient'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const newPatient = await service.createAllNewPatient(body);
      res.status(201).json(newPatient);
    } catch (error) {
      next(error);
    }
  }
);

// register new patient
router.post('/register-new',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(createPatientWithPersonSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const newPatient = await service.create(body,body.person_id);
      res.status(201).json(newPatient);
    } catch (error) {
      next(error);
    }
  }
);

// get my basic data
router.get('/my-basic-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.user;
      const patient = await service.getPatientData(patient_id);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// get my patient history
router.get('/all-my-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  async (req,res, next) => {
    try {
      const { user_id } = req.user;
      const patient = await service.getAllPatientData(user_id);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// update consents of a patient
router.patch('/update-consents',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  validatorHandler(updateConsentsSchema, 'body'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.user;
      const { full_consent, part_consent} = req.body;
      const patient = await service.updateConsents(patient_id,full_consent, part_consent);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// get patient history for med
router.get('/patient-history/:patient_id',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED'),
  validatorHandler(getPatientSchema, 'params'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.params;
      const patient = await service.getPatientHistory(patient_id);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// update patient basic info
router.patch('/update-info',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED'),
  validatorHandler(updatePatientSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const patient = await service.update(body);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

// get my appointments
router.get('/my-appointments',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.user;
      const patient = await service.getAppointmentInfo(patient_id);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
