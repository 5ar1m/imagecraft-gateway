const prisma = require('../prisma/client');

async function getUserByEmail(userEmail) {
  return await prisma.user.findUnique({
    where: { email: userEmail },
  });
}

async function createUser(data) {
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

module.exports = {
  getUserByEmail,
  createUser,
};