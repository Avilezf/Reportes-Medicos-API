const boom = require('@hapi/boom');
const { query } = require('express');
const pool = require('../libs/postgresPool');

const { config } = require('../config/config');
const UsersService = require('../services/usersService');
//const format = require('../utils/formatResponse');

const usersService = new UsersService();

class PersonsService {

  constructor(){
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  // get person by person id
  async getPersonById(person_id){
    const data = await this.pool.query("select * from v_persons where person_id = '"+person_id+"';");
    const person = (data.rows)[0];
    if (person) {
      return person;
    } else {
      throw boom.notFound('There is no person with that person id.')
    }
  }

  // get person by id number
  async getPersonByIdNumber(id_number){
    const data = await this.pool.query("select * from v_persons where id_number = '"+id_number+"' limit 1;");
    const person = (data.rows)[0];
    if (person) {
      return person
    } else {
      throw boom.notFound("Person not found");
    }
  }

  // verification on id is in the db
  async isIdRegistered(id_number){
    const query = (
      "select v_persons.person_id, \n"+
      "       patients.patient_id, \n"+
      "       employees.employee_id \n"+
      "from v_persons \n"+
      "left join patients \n"+
      "    on patients.person_id = v_persons.person_id \n"+
      "left join employees \n"+
      "    on employees.person_id = v_persons.person_id \n"+
      "where v_persons.id_number = '"+id_number+"' \n"+
      "limit 1;"
    );
    const data = await this.pool.query(query);
    const result = data.rows[0];
    if (result){
      return {
        person_id: result.person_id,
        patient_id: result.patient_id? result.patient_id:false,
        employee_id: result.employee_id? result.employee_id:false
      };
    }else {
      return {
        person_id: false,
        patient_id: false,
        employee_id: false
      };
    }
  }

  // update person info
  async update(data, person_id){
    const query = (
      "update persons \n"+
      "set \n"+
      "    first_name = '"+data.first_name+"', \n"+
      "    last_name = '"+data.last_name+"', \n"+
      "    gender = '"+data.gender+"', \n"+
      "    id_type = '"+data.id_type+"', \n"+
      "    id_number = '"+data.id_number+"', \n"+
      "    id_expedition_place = '"+data.id_expedition_place+"', \n"+
      "    civil_status = '"+data.civil_status+"', \n"+
      "    email = '"+data.email+"', \n"+
      "    phone_number = '"+data.phone_number+"', \n"+
      "    birth_date = '"+data.birth_date+"', \n"+
      "    id_expedition_date = '"+data.id_expedition_date+"' \n"+
      "where person_id = '"+person_id+"';"
    );const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "successful update"};
    }else {
      throw boom.badImplementation()
    }
  }
  //------------------------------Protected methods------------------------------//
  async create(data,user_id) {
    const foundPatient = await this.findPersonByUserId(user_id);
    if (foundPatient){
      throw boom.conflict('A patient is already asociated with the account');
    } else {
      const query = (
        "insert into persons values ('0', '"+
        data.first_name+"', '"+
        data.last_name+"', '"+
        data.gender+"', '"+
        data.id_type+"', '"+
        data.id_number+"','"+
        data.id_expedition_place+"','"+
        data.civil_status+"','"+
        data.email+"','"+
        data.phone_number+"','"+
        user_id+"',null,'"+
        data.birth_date+"', '"+
        data.id_expedition_date+"');"
      );
      const result = await this.pool.query(query);
      if (result.rowCount===1){
        return this.findPersonByUserId(user_id);
      }else {
        return {message: "Error"};
      }
    }
  }

  async sendWarningEmail(data){
    let email = null;
    if (data.person_id){
      const query = "select email from v_persons where person_id = '"+data.person_id+"';";
      const result = await this.pool.query(query);
      email = result.rows[0].email;
    }else {
      email = data.email;
    }
    if (email){
      const mail = {
        from: config.smtpEmail,
        to: `${email}`,
        subject: data.subject,
        html: data.html,
      }
      await usersService.sendMail(mail);
    }
  }

  async isEmailRegistered(email) {
    //select email from v_persons where email = 'victmma@gmail.com';
    const query = "select email from v_persons where email = '"+email+"';";
    const result = await this.pool.query(query);
    return result.rows[0]? true:false;
  }

  //-------------------------------Private methods-------------------------------//
  async findPersonByUserId(user_id) {
    const person = await this.pool.query("select person_id from v_persons where user_id = '"+user_id+"';");
    return person.rows[0];
  }

}

module.exports = PersonsService;

