const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWTSECRET,
    {
      expiresIn: '1h',
      jwtid: crypto.randomUUID(),
    },
  );
}

module.exports = { createToken };
