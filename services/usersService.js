const boom = require('@hapi/boom');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const pool = require('../libs/postgresPool');
const { config } = require('../config/config');
//const format = require('../utils/formatResponse');

class UsersService {

  constructor(){
    this.pool = pool;
    this.pool.on('error', (err) => console.error(err));
  }

  //-------------------------------Public methods--------------------------------//
  //Create JWT
  async signToken(user, role){
    const userData = await this.getUserInfo(user.user_id, role)
    const payload = {
      user_id: userData.user_id,
      person_id: userData.person_id,
      role_name: userData.role_name,
    }
    if (role === 'patient'){
      payload.patient_id= userData.patient_id;
    } else {
      payload.employee_id= userData.employee_id;
    }
    const token = jwt.sign(payload, config.jwtSecret);
    return {
      userData,
      token
    };
  }

  // Send Recover Mail
  async sendRecoveryMail(email) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw boom.unauthorized();
    }
    const payload = { user_id: user.user_id };
    const token = jwt.sign(payload, config.jwtSecret, {expiresIn: '15min'});
    const link = `${config.feUrl}/recovery/${token}`;
    const query = (
      "update users \n" +
      "set recovery_token = '"+token+"' \n" +
      "where user_id = '"+user.user_id+"';"
    );
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      const mail = {
        from: config.smtpEmail,
        to: `${user.email}`,
        subject: "Email para recuperar contraseña",
        html: `<b>Tiene 15 minutos para cambiar la contraseña. Ingresa a este link => ${link}</b>`,
      }
      const rta = await this.sendMail(mail);
      return rta;
    }else {
      throw boom.badImplementation();
    }
  }

  // Recover password
  async recoverPassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await this.findUserById(payload.user_id);
      if (user.recovery_token !== token) {
        throw boom.unauthorized();
      } else {
        const hash = await bcrypt.hash(newPassword, 10);
        const query = (
          "update users \n" +
          "set recovery_token = null, password_ = '"+hash+"' \n" +
          "where user_id = '"+user.user_id+"';"
        );
        const result = await this.pool.query(query);
        if (result.rowCount===1){
          return { message: 'password changed' };
        }else {
          throw boom.badImplementation();
        }
      }
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  // get user info
  async getUserInfo(user_id, role){
    if (role === 'patient' || role === 'employee'){
      const query = (
        "select users.*, \n"+
        "       persons.person_id, \n"+
        "       "+role+"s."+role+"_id, \n       "+
        (role === 'patient' ? "'patient' role_name \n" : "employees.role_name \n") +
        "from users \n"+
        "join persons \n"+
        "   on persons.user_id = users.user_id \n"+
        "join "+role+"s \n"+
        "   on "+role+"s.person_id = persons.person_id \n"+
        "where users.user_id = '"+user_id+"' \n"+
        "limit 1;"
      );
      const data =  await this.pool.query(query);
      if(data.rowCount === 0){
        throw boom.notFound('User is not registered as a(n) '+role+'.');
      } else {
        delete data.rows[0].recovery_token;
        delete data.rows[0].password_;
        return (data.rows)[0];
      }
    } else {
      throw boom.unauthorized('Role not allowed.');
    }
  }

  // Change password
  async changePassword(user_id, currentPassword, newPassword){
    try {
      const result = await this.pool.query(
        "select * from users where user_id ='"+user_id+"' limit 1;"
      );
      const foundUser = result.rows[0];
      if (!foundUser) {
        throw boom.notFound('User not found');
      } else {
        const matchedPassword = await bcrypt.compare(currentPassword, foundUser.password_);
        if (!matchedPassword){
          throw boom.unauthorized('Incorrect password');
        } else {
          const hash = await bcrypt.hash(newPassword, 10);
          const query = (
            "update users \n" +
            "set password_ = '"+hash+"' \n" +
            "where user_id = '"+user_id+"';"
          );
          const result = await this.pool.query(query);
          if (result.rowCount===1){
            return { message: 'password changed' };
          }else {
            return {message: "Error"};
          }
        }
      }
    } catch (error) {
      throw boom.unauthorized();
    }
  }

  // Delete User
  async delete(user_id){
    const query = ("delete from users where user_id = '"+user_id+"';");
    const result = await this.pool.query(query);
    if (result.rowCount===1){
      return {message: "successful delete!"};
    }else {
      return {message: "Error"};
    }
  }

  //------------------------------Protected methods------------------------------//
  // Register
  async create(data,email) {
    const foundUser = await this.findByUsername(data.username);
    if (foundUser) {
      throw boom.conflict('Username in use');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const query = (
        "insert into users values('0','"+
        data.username+"','"+
        hashedPassword+"',CURRENT_DATE,null);"
      );
      const result = await this.pool.query(query);
      if (result.rowCount===1){
        const mail = {
          from: config.smtpEmail,
          to: `${email}`,
          subject: "Bienvenido a GDPR-APP",
          html: `<b>Estamos felices de que esté con nosotros. Sus credenciales de inicio de sesión son: </b><br>`+
                `<b>Usuario: ${data.username}</b><br>`+
                `<b>Contraseña: ${data.password}</b><br>`
        }
        await this.sendMail(mail);
        return this.findByUsername(data.username);
      }else {
        return {message: "Error"};
      }
    }
  }

  // Login
  async login(data) {
    const result = await this.pool.query(
      "select * from users where username='"+data.username+"' limit 1;"
    );
    const foundUser = result.rows[0];
    if (!foundUser) {
      throw boom.notFound('Username not found');
    }
    const matchedPassword = await bcrypt.compare(data.password, foundUser.password_);
    if (!matchedPassword){
      throw boom.unauthorized('Incorrect password');
    }
    delete foundUser.recovery_token;
    delete foundUser.password_;
    return foundUser;
  }

  // Send mail
  async sendMail(infoMail) {
    const transporter = nodemailer.createTransport({
      host: config.mailHost,
      secure: true, // true for 465, false for other ports
      port: 465,
      auth: {
        user: config.mailUser,
        pass: config.mailPassword
      }
    });
    const result = await transporter.sendMail(infoMail);
    if (result.accepted.length > 0){
      return { message: 'mail sent.' };
    }else {
      return { message: 'mail not sent.' };
    }

  }
  //-------------------------------Private methods-------------------------------//
  // Get user
  async findUserById(id){
    const query = "select * from users where user_id = '"+id+"';";
    const foundUser =  await this.pool.query(query);
    if (foundUser.rows[0]) {
      delete foundUser.rows[0].password_;
    }
    return foundUser.rows[0];
  }
  async findByUsername(username) {
    const query = "select * from users where username = '"+username+"';";
    const foundUser =  await this.pool.query(query);
    if(foundUser.rows[0]){
      delete foundUser.rows[0].password_;
    }
    return foundUser.rows[0]
  }
  async findUserByEmail(email){
    const query = "select email, user_id from v_persons where email = '"+email+"';";
    const user =  await this.pool.query(query);
    return user.rows[0];
  }
}

module.exports = UsersService;
