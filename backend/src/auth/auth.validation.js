exports.validateRegister = (req, res, next) => {
  const body = req.body || {};
  const { fullName, email, password } = body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }
  next();
};

exports.validateLogin = (req, res, next) => {
  const body = req.body || {};
  const { email, password } = body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  next();
};

