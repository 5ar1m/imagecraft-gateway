const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(token) {
  return jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
}

module.exports = verifyToken;