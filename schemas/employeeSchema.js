const Joi = require('joi');

const employee_id = Joi.string();
const role_name = Joi.string();
const person_id = Joi.string();


const createEmployeeSchema = Joi.object({
  role_name: role_name.required()
});

const createEmployeeWithPersonSchema = Joi.object({
  role_name: role_name.required(),
  person_id: person_id.required()
});

const updateEmployeeWithPersonSchema = Joi.object({
  role_name: role_name.required(),
  employee_id: employee_id.required()
});

module.exports = {
  createEmployeeSchema,
  createEmployeeWithPersonSchema,
  updateEmployeeWithPersonSchema
}
