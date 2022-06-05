
const AppoinmentsService = require("../../services/appointmentsService");
const Pool = require('pg-pool')
const client = require('./poolClient')

//--------------------------------  Create ------------------------------------
describe("Create appointment", () => {

  beforeAll('Mock db connection and load app', async function () {
    // Create a new pool with a connection limit of 1
    const pool = new Pool({
      database: 'postgres',
      user: 'postgres',
      password: 'example',
      port: 5432,
      max: 1, // Reuse the connection to make sure we always hit the same temporal schema
      idleTimeoutMillis: 0 // Disable auto-disconnection of idle clients to make sure we always hit the same temporal schema
    })

    // Mock the query function to always return a connection from the pool we just created
    client.query = (text, values) => {
      return pool.query(text, values)
    }

    // It's important to import the app after mocking the database connection
      let app = require('./index')
  })

  beforeEach('Create temporary tables', async function () {
    await client.query('CREATE TEMPORARY TABLE appointment (LIKE appointment INCLUDING ALL)') // This will copy constraints also
  })

  // Optionally we could insert fake data before each test, but in this case it's not needed
  // beforeEach('Insert fake data', async function () {
  //   await client.query('INSERT INTO pg_temp.note (name, content) VALUES ("a_note", "some_content")')
  // })

  afterEach('Drop temporary tables', async function () {
    await client.query('DROP TABLE IF EXISTS pg_temp.appointment')
  })

  test('Appointment Created', async () => {

    const newAppointment = {
      patient_id: '760982f1-70ce-4817-ae85-318d5720dda4',
      reason: 'Dolor de Cabeza'
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.create(newAppointment);
    expect(response.message).toBe('Created');


  });

  test('Appointment Error ID Do not exists', async () => {

    const newAppointment = {
      patient_id: '760982f1-70ce-4817-ae85-318d5720dda5',
      reason: 'Dolor de Cabeza'
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.create(newAppointment);
    expect(response.message).toBe('Error');

  });

});

//--------------------------------  Update ------------------------------------

describe("Update appointment", () => {

  test('Appointment Programar', async () => {

    const newAppointment = {
      appointment_id: '64278014-1d68-4883-a664-340f0f3f1fe4',
      status: 'Programada'
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.update(newAppointment);
    expect(response.message).toBe('Updated!');
    expect(newAppointment.status).toBe('Programada');

  });

  test('Appointment Cancelar', async () => {

    const newAppointment = {
      appointment_id: '64278014-1d68-4883-a664-340f0f3f1fe4',
      status: 'Cancelada'

    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.update(newAppointment);
    expect(response.message).toBe('Updated!');
    expect(newAppointment.status).toBe('Cancelada');

  });

  test('Appointment Update', async () => {

    const newAppointment = {
      appointment_id: '64278014-1d68-4883-a664-340f0f3f1fe4',
      reason: 'Dolor'

    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.update(newAppointment);
    expect(response.message).toBe('Updated!');
    expect(newAppointment.reason).not.toBeNull();
    expect(newAppointment.reason).not.toBe('');

  });


  test('Appointment Update Error ID Do not exists', async () => {

    const newAppointment = {
      appointment_id: '760982f1-70ce-4817-ae85-318d5720dda5',
      reason: 'Dolor de Cabeza',
      //status: 'Programada'
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.update(newAppointment);
    expect(response.message).toBe('Error');

  });

  test('Appointment Update Error Reason and Status', async () => {

    const newAppointment = {
      appointment_id: '64278014-1d68-4883-a664-340f0f3f1fe4',
      reason: 'Dolor de Cabeza',
      status: 'Programada'
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.update(newAppointment);
    expect(response.message).toBe('Error');

  });

});

//--------------------------------  Get ------------------------------------
describe("Get appointment", () => {

  test('Appointment Get appointment_id', async () => {

    const appointment_id = 'b836d589-4a7e-4d96-800d-e10c8d54a204';

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.get(appointment_id);
    expect(response.message).not.toBeNull();
    expect(response.reason).toBe('Dolor de pecho');

  });

  test('Appointment Get patient_id', async () => {

    const patient_id = '760982f1-70ce-4817-ae85-318d5720dda4';

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.getMyAppointments(patient_id);
    expect(response.message).not.toBeNull();

  });

  test('Appointment Get filters status', async () => {

    const filters = {
      status: "Programada",
      id_number: "1005928740",
      limit: 9,
      offset: 0
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.getAppointments(filters);
    expect(response).not.toBeNull();

  });

  test('Appointment Get filters limit', async () => {

    const filters = {
      status: "Programada",
      id_number: "1005928740",
      limit: 9,
      offset: 0
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.getAppointments(filters);
    expect(response).not.toBeNull();

  });

  test('Appointment Get filters id_number', async () => {

    const filters = {
      status: "Programada",
      id_number: "1005928740",
      limit: 9,
      offset: 0
    }

    const appointmentService = new AppoinmentsService();
    let response = await appointmentService.getAppointments(filters);
    expect(response).not.toBeNull();

  });


});
