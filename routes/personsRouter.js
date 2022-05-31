const express = require('express');
const passport = require('passport');

const PersonsService = require('../services/personsService');
const validatorHandler = require('../middlewares/validatorHandler');
const { checkRoles } = require('../middlewares/authHandler');
const {
  createPersonSchema,
  getByIdNumberSchema
} = require('../schemas/personSchema');

const router = express.Router();
const service = new PersonsService();

// get my person data
router.get('/',
  passport.authenticate('jwt', {session: false}),
  async (req,res, next) => {
    try {
      const { person_id } = req.user;
      const person = await service.getPersonById(person_id);
      res.status(201).json(person);
    } catch (error) {
      next(error);
    }
  }
);

// get person data by id number
router.get('/get-person',
  passport.authenticate('jwt', {session: false}),
  checkRoles('HUM'),
  validatorHandler(getByIdNumberSchema, 'body'),
  async (req,res, next) => {
    try {
      const { id_number } = req.body;
      const person = await service.getPersonByIdNumber(id_number);
      res.status(201).json(person);
    } catch (error) {
      next(error);
    }
  }
);

// verify if an id is in the db
router.get('/verify-id-number',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED'),
  validatorHandler(getByIdNumberSchema, 'body'),
  async (req,res, next) => {
    try {
      const { id_number } = req.body;
      const person = await service.isIdRegistered(id_number);
      res.status(201).json(person);
    } catch (error) {
      next(error);
    }
  }
);

// update my person info
router.put('/update-info',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(createPersonSchema, 'body'),
  async (req,res, next) => {
    try {
      const { person_id } = req.user;
      const body = req.body;
      const person = await service.update(body, person_id);
      res.status(201).json(person);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
