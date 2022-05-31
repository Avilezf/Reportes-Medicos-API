const express = require('express');
const passport = require('passport');

const CareService = require('../services/careService');
const validatorHandler = require('../middlewares/validatorHandler');
const { checkRoles } = require('../middlewares/authHandler');
const {
  createCareSchema,
  updateCareSchema,
  getCareSchema
} = require('../schemas/careSchema');

const router = express.Router();
const service = new CareService();

router.post('/',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED','HUM'),
  validatorHandler(createCareSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const newCare = await service.create(body);
      res.status(201).json(newCare);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/',
  passport.authenticate('jwt', {session: false}),
  checkRoles('MED'),
  validatorHandler(updateCareSchema, 'body'),
  async (req,res, next) => {
    try {
      const body = req.body;
      const care = await service.update(body);
      res.status(201).json(care);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:careid',
  passport.authenticate('jwt', {session: false}),
  validatorHandler(getCareSchema, 'params'),
  async (req,res, next) => {
    try {
      const { careid } = req.params;
      const care = await service.get(careid);
      res.status(201).json(care);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
