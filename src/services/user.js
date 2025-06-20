const prisma = require('../prisma/client');

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
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

module.exports = {
  getUserById,
  createUser,
};