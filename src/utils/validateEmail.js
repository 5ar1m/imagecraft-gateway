const { z } = require('zod');

const emailSchema = z.string().email();

function validateEmail(email) {
  const result = emailSchema.safeParse(email);
  return result.success;
}

module.exports = validateEmail;