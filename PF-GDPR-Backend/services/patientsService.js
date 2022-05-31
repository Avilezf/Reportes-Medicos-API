const boom = require('@hapi/boom');
const pool = require('../libs/postgresPool');
const jwt = require('jsonwebtoken');

const { config } = require('../config/config');

const UsersService = require('../services/usersService');
const PersonsService = require('../services/personsService');
const format = require('../utils/formatResponse');

const usersService = new UsersService();
const personsService = new PersonsService();

class PatientsService {

  constructor(){
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  //Register all new patient
  async createAllNewPatient(data) {
    const {person_id, patient_id} = await personsService.isIdRegistered(data.person.id_number);
    if (person_id || patient_id){
      await personsService.sendWarningEmail({
        person_id: person_id,
        subject: "Aviso de brecha de datos",
        html: `<b>Alguien ha intentado crear una cuenta con su numero de identificación. Contáctese con nosotros para más información.</b>`
      });
      throw boom.conflict("There's someone already registered.");
    } else {
      const newUser = await usersService.create(data.user, data.person.email);
      const newPerson = await personsService.create(data.person, newUser.user_id);
      return await this.create(data.patient,newPerson.person_id);
    }
  }
  //Register new patient
  async create(newPatient,person_id){
    const foundPatient = await this.findPatientByPersonId(person_id);
    if (foundPatient) {
      throw boom.conflict('A patient already exist for this person.');
    } else {
      const query = (
        "insert into patients values('0','"+
        newPatient.height+"','"+
        newPatient.weight+"','"+
        newPatient.rh+"','"+
        person_id+"','"+
        newPatient.full_consent+"','"+
        newPatient.part_consent+"');"
      );
      const result = await this.pool.query(query);
      if (result.rowCount===1){
        return {message: "Created"};
      }else {
        throw boom.badImplementation();
      }
    }
  }

  //get patient data
  async getPatientData(patient_id){
    const query = (
      "select v_persons.*, v_patients.* \n"+
      "from v_patients \n"+
      "join v_persons \n"+
      "    on v_persons.person_id = v_patients.person_id \n"+
      "where v_patients.patient_id = '"+patient_id+"' \n"+
      "limit 1;"
    );
    const result = await this.pool.query(query);
    delete result.rows[0].person_id;
    delete result.rows[0].user_id;
    delete result.rows[0].attendant_id;
    delete result.rows[0].patient_id;
    const data = format(result.rows)[0];
    if (data){
      return data;
    } else {
      throw boom.notFound("Patient not found");
    }
  }

  //get patient all data
  async getAllPatientData(user_id){
    const query = (
      "select * from gdpr_view_all_patient_data_decrypted('"+user_id+"');"
    );
    const result = await this.pool.query(query);
    const data = result.rows;
    if (data){
      const formated = format(data);
      return {formated,data};
    } else {
      throw boom.notFound("Patient not found");
    }
  }


  // Modify consents
  async updateConsents(patient_id,full_consent,part_consent){
    const query = (
      "update patients \n"+
      "set full_consent = "+full_consent+", part_consent = "+part_consent+" \n"+
      "where patient_id = '"+patient_id+"';"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "consent changed"};
    }else {
      return {message: "Error"};
    }
  }

  // Get info for employee
  async getPatientHistory(patient_id){
    const query = (
      "select users.user_id \n"+
      "from patients \n"+
      "join persons \n"+
      "    on persons.person_id = patients.person_id \n"+
      "join users \n"+
      "    on users.user_id = persons.user_id \n"+
      "where patients.patient_id = '"+patient_id+"' \n"+
      "limit 1;"
    );
    const data = await this.pool.query(query);
    const { user_id } = data.rows[0];
    if (user_id) {
      const result = await this.getAllPatientData(user_id);
      return result.formated;
    }else {
      throw boom.notFound();
    }
  }

  // Update patient info
  async update(data){
    const query = (
      "update patients \n"+
      "set \n"+
      "    height = '"+data.height+"', \n"+
      "    weight = '"+data.weight+"', \n"+
      "    rh = '"+data.rh+"' \n"+
      "where patient_id = '"+data.patient_id+"';"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "successful update"};
    }else {
      return {message: "Error"};
    }
  }

  // Get appointments info
  async getAppointmentInfo(patient_id){
    const query = (
      "select care.careid, \n"+
      "       care.employee_id, \n"+
      "       v_persons.first_name || ' ' || v_persons.last_name med_name, \n"+
      "       care.reason, \n"+
      "       care.care_date \n"+
      "from care \n"+
      "join employees \n"+
      "    on employees.employee_id = care.employee_id \n"+
      "join v_persons \n"+
      "    on v_persons.person_id = employees.person_id \n"+
      "where care.patient_id = '"+patient_id+"';"
    );
    const result = await this.pool.query(query);
    const data = (result.rows);
    if (data){
      return data;
    } else {
      throw boom.notFound("You have no appointments");
    }
  }

  //-------------------------------Private methods-------------------------------//
  async findPatientByPersonId(person_id) {
    const foundPatient = await this.pool.query(
      "select * from patients where person_id = '"+person_id+"' limit 1;"
    );
    return foundPatient.rows[0];
  }
  async viewPatientData(person_id){
    const query = "select * from view_all_patient_data_desencrypted('"+person_id+"');"
    const result = await this.pool.query(query);
    return result.rows[0];
  }

}

module.exports = PatientsService;
