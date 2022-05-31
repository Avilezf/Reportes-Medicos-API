require('dotenv').config();
var fs = require('fs');

const config = {
  env: process.env.NODE_ENV || 'dev',
  isProd: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3000,
  feUrl: process.env.FE_URL,
  jwtSecret: process.env.JWT_SECRET,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbPort: process.env.DB_PORT,
  dbSslMode: process.env.DB_SSLMODE,
  dbServerCa: [fs.readFileSync(process.env.DB_SERVERCAPATH, "utf8")],
  dbName: process.env.DB_NAME,
  mailHost: process.env.MAIL_HOST,
  mailUser: process.env.MAIL_USER,
  mailPassword: process.env.MAIL_PASSWORD
};

module.exports = { config };
