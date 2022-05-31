const express = require('express');
const passport = require('passport');

const UsersService = require('../services/usersService');
const validatorHandler = require('../middlewares/validatorHandler');
const {
  loginUserSchema,
  recoverySchema,
  passwordRecoverySchema,
  changePasswordSchema
} = require('../schemas/userSchema');

const router = express.Router();
const service = new UsersService();

// Login
router.post('/login',
  validatorHandler(loginUserSchema, 'body'),
  passport.authenticate('local', {session: false}),
  async (req, res, next) => {
    try {
      const user = req.user;
      const { role } = req.body;
      res.json(await service.signToken(user, role));
    } catch (error) {
      next(error);
    }
  }
);

// Recovery recoverySchema
router.post('/recovery',
validatorHandler(recoverySchema, 'body'),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const rta = await service.sendRecoveryMail(email);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

// Recover password passwordRecoverySchema
router.patch('/recover-password',
  validatorHandler(passwordRecoverySchema, 'body'),
  async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      const rta = await service.recoverPassword(token, newPassword);
      res.json(rta);
    } catch (error) {
      next(error);
    }
  }
);

// Get my user
router.get('/',
  passport.authenticate('jwt', {session: false}),
  async (req,res, next) => {
    try {
      const {user_id, role_name } = req.user;
      const role = role_name === 'patient' ? role_name : 'employee'
      const user = await service.getUserInfo(user_id, role);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
});

// Change password
router.patch('/change-password',
  validatorHandler(changePasswordSchema, 'body'),
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    try {
      const { user_id } = req.user;
      const { currentPassword, newPassword } = req.body;
      res.json(await service.changePassword(user_id, currentPassword, newPassword));
    } catch (error) {
      next(error);
    }
  }
);

// Delete my user
router.delete('/delete-my-user',
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    try {
      const { user_id } = req.user;
      res.json(await service.delete(user_id));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
