const boom = require('@hapi/boom');

const pool = require('../libs/postgresPool');
//const format = require('../utils/formatResponse');

class AppoinmentsService {

  constructor() {
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  //Create care
  async create(newAppointment) {

    try {
      const query = (
        "insert into appointments values('0','" +
        newAppointment.patient_id + "','" +
        newAppointment.reason + "',LOCALTIMESTAMP,'Pendiente');"
      );
      const result = await this.pool.query(query);
      if (result.rowCount === 1) {
        return { message: "Created" };
      } else {
        return { message: "Error" };
      }
    } catch (error) {
      return { message: "Error" }
    }

  }

  // update
  async update(data) {

    try {
      const query = (
        "update appointments \n" +
        "set \n" +
        (data.reason ? "     reason = '" + data.reason + "' \n" : "") +
        (data.status ? "     status = '" + data.status + "' \n" : "") +
        "where appointment_id = '" + data.appointment_id + "';"
      );
      const result = await this.pool.query(query);
      if (result.rowCount === 1) {
        return { message: "Updated!" };
      } else {
        return { message: "Error" };
      }
    } catch (error) {
      return { message: "Error" }
    }

  }

  // get
  async get(appointment_id) {
    const query = (
      "select * from appointments where appointment_id = '" + appointment_id + "' limit 1;"
    );
    const result = await this.pool.query(query);
    const data = (result.rows)[0];
    if (data) {
      return data;
    } else {
      throw boom.notFound()
    }
  }

  async getMyAppointments(patient_id) {
    const query = (
      "select * from appointments where patient_id = '" + patient_id + "';"
    );
    const result = await this.pool.query(query);
    const data = (result.rows);
    if (data) {
      return data;
    } else {
      throw boom.notFound()
    }
  }

  async getAppointments(filters) {
    const filter = filters.id_number ? (
      filters.status ? (
        "join patients \n" +
        "    on patients.patient_id = appointments.patient_id \n" +
        "join v_persons \n" +
        "    on v_persons.person_id = patients.person_id \n" +
        "where v_persons.id_number = '" + filters.id_number + "' and status = '" + filters.status + "' \n"
      ) : (
        "join patients \n" +
        "    on patients.patient_id = appointments.patient_id \n" +
        "join v_persons \n" +
        "    on v_persons.person_id = patients.person_id \n" +
        "where v_persons.id_number = '" + filters.id_number + "' \n"
      )
    ) : filters.status ? (
      "where status = '" + filters.status + "' \n"
    ) : "";
    const query = (
      "select appointments.* \n" +
      "from appointments \n" +
      filter +
      "order by case when status = 'Pendiente' then 1 \n" +
      "              when status = 'Programada' then 2 \n" +
      "              when status = 'Cancelada' then 3 \n" +
      "              else 4 \n" +
      "         end asc, appointment_date \n" +
      "limit " + filters.limit + " offset " + filters.offset + ";"
    );
    const result = await this.pool.query(query);
    const data = (result.rows);
    if (data) {
      return data;
    } else {
      throw boom.notFound()
    }
  }
  //-------------------------------Private methods-------------------------------//
}

module.exports = AppoinmentsService;
