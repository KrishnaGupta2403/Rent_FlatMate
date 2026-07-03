module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: User role not found' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access denied for role '${req.user.role}'. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
