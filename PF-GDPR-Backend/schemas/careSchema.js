const Joi = require('joi');

const careid = Joi.string();
const employee_id = Joi.string();
const patient_id = Joi.string();
const reason = Joi.string();
const cregimen = Joi.string();
const pasthealth = Joi.string();
const formulation = Joi.string();
const plan =  Joi.string();
const care_date = Joi.string()

const createCareSchema = Joi.object({
  employee_id: employee_id.required(),
  patient_id: patient_id.required(),
  reason: reason.required(),
  cregimen: cregimen,
  pasthealth: pasthealth,
  care_date: care_date.required()
});

const updateCareSchema = Joi.object({
  careid: careid.required(),
  employee_id: employee_id,
  formulation: formulation,
  plan: plan,
  care_date: care_date
});

const getCareSchema = Joi.object({
  careid: careid.required()
});
module.exports = {
  createCareSchema,
  updateCareSchema,
  getCareSchema
}
