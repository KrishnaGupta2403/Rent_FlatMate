exports.validateUpdatePreferences = (req, res, next) => {
  if (req.body && typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Invalid tenant preferences update payload' });
  }
  next();
};
