const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authorization = req.get('authorization');

  if (!authorization) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  try {
    req.user = jwt.verify(match[1], process.env.JWTSECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
