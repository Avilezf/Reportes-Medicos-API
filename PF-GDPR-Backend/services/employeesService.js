const boom = require('@hapi/boom');
const pool = require('../libs/postgresPool');
const jwt = require('jsonwebtoken');

const { config } = require('../config/config');

const UsersService = require('../services/usersService');
const PersonsService = require('../services/personsService');
//const format = require('../utils/formatResponse');

const usersService = new UsersService();
const personsService = new PersonsService();

class EmployeesService {

  constructor(){
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  //Register all new employee
  async createAllNewEmployee(data) {
    const {person_id, employee_id} = await personsService.isIdRegistered(data.person.id_number);
    if (person_id || employee_id){
      await personsService.sendWarningEmail({
        person_id: person_id,
        subject: "Aviso de brecha de datos",
        html: `<b>Alguien ha intentado crear una cuenta con su numero de identificación. Contáctese con nosotros para más información.</b>`
      });
      throw boom.conflict("There's someone already registered.");
    } else {
      const newUser = await usersService.create(data.user, data.person.email);
      const newPerson = await personsService.create(data.person, newUser.user_id);
      return await this.create(data.employee,newPerson.person_id);
    }
  }

  //Register new employee
  async create(newEmployee,person_id){
    const foundEmployee = await this.findEmployeeByPersonId(person_id);
    if (foundEmployee) {
      throw boom.conflict('A employee already exist for this person.');
    } else {const query = (
      "insert into employees values('0','"+
        newEmployee.role_name+"','"+
        person_id+"');"
      );
      const result = await this.pool.query(query);
      if (result.rowCount===1){
        return {message: "Created"};//this.viewEmployeeData(data.person_id);
      }else {
        throw boom.badImplementation();
      }
    }
  }

  //get employee data
  async getEmployeeData(employee_id){
    const query = (
      "select v_persons.*, employees.* \n"+
      "from employees \n"+
      "join v_persons \n"+
      "    on v_persons.person_id = employees.person_id \n"+
      "where employees.employee_id = '"+employee_id+"' \n"+
      "limit 1;"
    );
    const result = await this.pool.query(query);
    delete result.rows[0].person_id;
    delete result.rows[0].user_id;
    delete result.rows[0].attendant_id;
    delete result.rows[0].employee_id;
    const data = (result.rows)[0];
    if (data){
      return data;
    } else {
      throw boom.notFound("Employee not found");
    }
  }

  // Get appointments info
  async getAppointmentInfo(employee_id){
    const query = (
      "select care.careid, \n"+
      "       care.patient_id, \n"+
      "       v_persons.first_name || ' ' || v_persons.last_name pat_name, \n"+
      "       date_part('year', age(v_persons.birth_date::date))::int, \n"+
      "       care.reason, \n"+
      "       care.care_date \n"+
      "from care \n"+
      "join patients \n"+
      "    on patients.patient_id = care.patient_id \n"+
      "join v_persons \n"+
      "    on v_persons.person_id = patients.person_id \n"+
      "where care.employee_id = '"+employee_id+"';"
    );
    const result = await this.pool.query(query);
    const data = (result.rows);
    if (data){
      return data;
    } else {
      throw boom.notFound("You have no appointments");
    }
  }

  // Update patient info
  async update(data){
    const query = (
      "update employees \n"+
      "set \n"+
      "    role_name = '"+data.role_name+"' \n"+
      "where employee_id = '"+data.employee_id+"';"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "Successful update"};
    }else {
      throw boom.badImplementation();
    }
  }

  // get Anonimized data
  async getAnonimizedData(){
    const query = (
      "select * from gdpr_view_all_patient_data_anonymized()"
    );
    const data = await this.pool.query(query);
    return data.rows;
  }

  // get full data for third party
  async getFullDataForThridParty(){
    const query = (
      "select * from gdpr_view_all_patient_data_third_party();"
    );
    const data = await this.pool.query(query);
    if(data.rowCount>0){
      data.rows.map(async person => {
        await personsService.sendWarningEmail({
          email: person.email,
          subject: "Su data ha sido compartida",
          html: `<p>Le informamos que su información ha sido compartida gracias a que nos dio su consentimiento</p><br>`+
                `<p>Le recordamos que puede cambiar su consentimiento en cualquier momento entrando a la configuración en su perfil</p>`
        });
      });
      return data.rows;
    } else {
      return {message: "No data"}
    }
  }

  // get full data of a patient for third party
  async getPatientForThridParty(id_number){
    const query = (
      "select * from gdpr_individual_patient_data_third_party('"+id_number+"');"
    );
    const data = await this.pool.query(query);
    const info = data.rows[0];
    if(info){
      await personsService.sendWarningEmail({
        email: info.email,
        subject: "Su data ha sido compartida",
        html: `<p>Le informamos que su información ha sido solicitada y compartida gracias a que nos dio su consentimiento</p><br>`+
              `<p>Le recordamos que puede cambiar su consentimiento en cualquier momento entrando a la configuración en su perfil</p>`
      });
      return info;
    } else {
      const result = await personsService.getPersonByIdNumber(id_number);
      await personsService.sendWarningEmail({
        email: result.email,
        subject: "Alerta!",
        html: `<p>Le informamos que se ha intentado solicitar su información pero se ha protegido, comuniquese con nosotros para más información</p><br>`+
              `<p>Le recordamos que puede cambiar su consentimiento en cualquier momento entrando a la configuración en su perfil</p>`
      });
      return {message: "No data"}
    }
  }

  // list doctors
  async listDoctors(){
    const query = (
      "select employees.person_id, \n"+
      "       employees.employee_id, \n"+
      "       v_persons.first_name, \n"+
      "       v_persons.last_name \n"+
      "from employees \n"+
      "join v_persons \n"+
      "    on v_persons.person_id = employees.person_id \n"+
      "where employees.role_name = 'MED';"
    );
    const result = await this.pool.query(query);
    const data = (result.rows);
    return data;
  }

  //-------------------------------Private methods-------------------------------//
  async findEmployeeByPersonId(person_id) {
    const foundEmployee = await this.pool.query(
      "select * from employees where person_id = '"+person_id+"';"
    );
    return foundEmployee.rows[0];
  }
}

module.exports = EmployeesService;
