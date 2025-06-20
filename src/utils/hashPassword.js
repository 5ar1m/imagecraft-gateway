const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function hashPassword(plainPassword) {
  const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  return hashed;
}

module.exports = hashPassword;