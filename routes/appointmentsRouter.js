const express = require('express');
const passport = require('passport');

const AppointmentsService = require('../services/appointmentsService');
const validatorHandler = require('../middlewares/validatorHandler');
const { checkRoles } = require('../middlewares/authHandler');

const router = express.Router();
const service = new AppointmentsService();

router.post('/',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.user;
      const { reason } = req.body;
      const newAppointment = await service.create({patient_id, reason});
      res.status(201).json(newAppointment);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient','MED','HUM'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const appointment = await service.update(body);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED','HUM'),
  async (req,res, next) => {
    try {
      const filters = req.query;
      if (filters.limit) filters.limit = parseInt(filters.limit);
      if (filters.offset) filters.offset = parseInt(filters.offset);
      const appointments = await service.getAppointments(filters);
      res.status(201).json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/my-appointments',
  passport.authenticate('jwt', {session: false}),
  checkRoles('patient'),
  async (req,res, next) => {
    try {
      const { patient_id } = req.user;
      const appointments = await service.getMyAppointments(patient_id);
      res.status(201).json(appointments);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:appointment_id',
  passport.authenticate('jwt', {session: false}),
  async (req,res, next) => {
    try {
      const { appointment_id } = req.params;
      const appointment = await service.get(appointment_id);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
