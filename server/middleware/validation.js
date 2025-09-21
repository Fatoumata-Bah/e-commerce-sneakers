const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName, role } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is invalid');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!firstName || typeof firstName !== 'string') {
    errors.push('First name is required');
  } else if (firstName.length < 2) {
    errors.push('First name must be at least 2 characters');
  }

  if (!lastName || typeof lastName !== 'string') {
    errors.push('Last name is required');
  } else if (lastName.length < 2) {
    errors.push('Last name must be at least 2 characters');
  }

  if (role && !['admin', 'seller', 'customer'].includes(role)) {
    errors.push('Role must be admin, seller, or customer');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
