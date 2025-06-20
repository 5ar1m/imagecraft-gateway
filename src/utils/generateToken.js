const jwt = require('jsonwebtoken');
const { promisify } = require('util');
require('dotenv').config();

const signAsync = promisify(jwt.sign);

async function generateToken(payload) {
  return await signAsync(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

module.exports = generateToken;