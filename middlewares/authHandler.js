const boom = require('@hapi/boom');

function checkAdminRole(req, res, next) {
  const user = req.user;
  if (user.role === 'admin') {
    next();
  } else {
    next(boom.unauthorized());
  }
}

function checkRoles(...roles) {
  return (req, res, next) => {
    const user = req.user;
    if (roles.includes(user.role_name)) {
      next();
    } else {
      next(boom.unauthorized());
    }
  }
}

module.exports = { checkAdminRole, checkRoles }
