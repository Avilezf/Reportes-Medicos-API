const express = require('express');
const passport = require('passport');

const EmployeesService = require('../services/employeesService');
const validatorHandler = require('../middlewares/validatorHandler');
const { checkRoles } = require('../middlewares/authHandler');
const {
  createUserSchema,
} = require('../schemas/userSchema');
const {
  createPersonSchema
} = require('../schemas/personSchema');
const {
  createEmployeeSchema,
  createEmployeeWithPersonSchema,
  updateEmployeeWithPersonSchema
} = require('../schemas/employeeSchema');


const router = express.Router();
const service = new EmployeesService();

// Register all new patient
router.post('/register-all-new',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(createUserSchema, 'body.user'),
  validatorHandler(createPersonSchema, 'body.person'),
  validatorHandler(createEmployeeSchema, 'body.employee'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const newEmployee = await service.createAllNewEmployee(body);
      res.status(201).json(newEmployee);
    } catch (error) {
      next(error);
    }
  }
);

// Register new employee
router.post('/register-new',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(createEmployeeWithPersonSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const newEmployee = await service.create(body,body.person_id);
      res.status(201).json(newEmployee);
    } catch (error) {
      next(error);
    }
  }
);

// Get my basic data
router.get('/my-basic-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED','HUM'),
  async (req,res, next) => {
    try {
      const { employee_id } = req.user;
      const employee = await service.getEmployeeData(employee_id);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// get my appointments
router.get('/my-appointments',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED'),
  async (req,res, next) => {
    try {
      const { employee_id } = req.user;
      const employee = await service.getAppointmentInfo(employee_id);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// update employee basic info
router.patch('/update-info',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(updateEmployeeWithPersonSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const employee = await service.update(body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }
);

// Get anonimized data
router.get('/anonimized-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  async (req,res, next) => {
    try {
      const data = await service.getAnonimizedData();
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Get full data for third party
router.get('/full-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  async (req,res, next) => {
    try {
      const data = await service.getFullDataForThridParty();
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Get full data of patient for third party
router.get('/one-patient-full-data',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  async (req,res, next) => {
    try {
      const { id_number } = req.body;
      const data = await service.getPatientForThridParty(id_number);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Get list of doctors
router.get('/doctors',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  async (req,res, next) => {
    try {
      const data = await service.listDoctors();
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
