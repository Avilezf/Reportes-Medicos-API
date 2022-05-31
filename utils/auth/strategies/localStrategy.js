const { Strategy } = require('passport-local');

const UserService = require('../../../services/usersService');
const service = new UserService();

const LocalStrategy = new Strategy(
  async (username, password, done) => {
    try {
      const user = await service.login({
        username: username,
        password: password
      });
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
);

module.exports = LocalStrategy;
