const validateRegister = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is invalid');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  if (!firstName || firstName.length < 2) {
    errors.push('First name is required');
  }
  if (!lastName || lastName.length < 2) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is invalid');
  }
  if (!password) {
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
