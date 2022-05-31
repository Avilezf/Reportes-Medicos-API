const Joi = require('joi');

const first_name = Joi.string();
const last_name = Joi.string();
const birth_date = Joi.string();
const gender = Joi.string();
const id_type = Joi.string();
const id_number = Joi.string();
const id_expedition_date = Joi.string();
const id_expedition_place = Joi.string();
const civil_status = Joi.string();
const email = Joi.string();
const phone_number = Joi.string();

const createPersonSchema = Joi.object({
  first_name: first_name,
  last_name: last_name.required(),
  birth_date: birth_date.required(),
  gender: gender.required(),
  id_type: id_type.required(),
  id_number: id_number.required(),
  id_expedition_date: id_expedition_date.required(),
  id_expedition_place: id_expedition_place.required(),
  civil_status: civil_status.required(),
  email: email.required(),
  phone_number: phone_number.required()
});

const getByIdNumberSchema = Joi.object({
  id_number: id_number.required()
});

module.exports = {
  createPersonSchema,
  getByIdNumberSchema
}
