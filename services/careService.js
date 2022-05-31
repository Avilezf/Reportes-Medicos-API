const boom = require('@hapi/boom');

const pool = require('../libs/postgresPool');
//const format = require('../utils/formatResponse');

class CareService {

  constructor(){
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  //Create care
  async create(newCare){
    const query = (
      "insert into care values('0','"+
      newCare.employee_id+"','"+
      newCare.patient_id+"','"+
      newCare.reason+"','"+
      newCare.cregimen+"','"+
      newCare.pasthealth+"',null,null,'"+
      newCare.care_date+"');"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "Created"};
    }else {
      return {message: "Error"};
    }
  }

  // update
  async update(data){
    const query = (
      "update care \n"+
      "set \n"+
      "     care_date = '"+data.care_date +"', \n"+
      "     employee_id = '"+data.employee_id +"', \n"+
      "     formulation = '"+data.formulation +"', \n"+
      "     plan = '"+data.plan +"' \n"+
      "where careid = '"+data.careid+"';"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "Created"};
    }else {
      return {message: "Error"};
    }
  }

  // get
  async get(careid){
    const query = (
      "select care.careid, \n"+
      "       care.employee_id, \n"+
      "       v_emp.first_name || ' ' || v_emp.last_name med_name, \n"+
      "       care.patient_id, \n"+
      "       v_pat.first_name || ' ' || v_pat.last_name pat_name, \n"+
      "       care.reason \n"+
      "from care \n"+
      "join employees \n"+
      "    on employees.employee_id = care.employee_id \n"+
      "join patients \n"+
      "    on patients.patient_id = care.patient_id \n"+
      "join v_persons v_emp \n"+
      "    on v_emp.person_id = employees.person_id \n"+
      "join v_persons v_pat \n"+
      "    on v_pat.person_id = patients.person_id \n"+
      "where careid = '"+careid+"' limit 1;"
    );
    const result = await this.pool.query(query);
    const data = (result.rows)[0];
    if(data){
      return data;
    }else {
      throw boom.notFound()
    }
  }
  //-------------------------------Private methods-------------------------------//
}

module.exports = CareService;
