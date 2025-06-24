const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = verifyToken;