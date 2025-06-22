const jwt = require('jsonwebtoken');
require('dotenv').config();

async function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = verifyToken;