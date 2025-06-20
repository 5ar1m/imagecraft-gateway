const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config();

const verifyAsync = promisify(jwt.verify);

async function verifyToken(token) {
  return await verifyAsync(token, process.env.JWT_SECRET);
}

module.exports = verifyToken;