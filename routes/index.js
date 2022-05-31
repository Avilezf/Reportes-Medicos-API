const express = require('express');

const usersRouter = require('./usersRouter');
const personsRouter = require('./personsRouter');
const patientsRouter = require('./patientsRouter');
const employeesRouter = require('./employeesRouter');
const careRouter = require('./careRouter');
const appointmentsRouter = require('./appointmentsRouter');

function routerApi(app) {

  const router = express.Router();
  app.use('/api/v1', router);

  router.use('/', express.Router().get('/',
    async (req,res, next) => {
      try {
        res.status(200).send("Welcome to the backend API for GDPR!");
      } catch (error) {
        next(error);
      }
    }
  ));
  router.use('/users', usersRouter);
  router.use('/persons', personsRouter);
  router.use('/patients', patientsRouter);
  router.use('/employees', employeesRouter);
  router.use('/care', careRouter);
  router.use('/appointments', appointmentsRouter);
}

module.exports = routerApi;
