const prisma = require('../prisma/client');

async function addImage(data) {
  return await prisma.user.create({
    data: {
      name: data.name,
      mimeType: data.mimeType,
      userId: data.userId,
    },
  });
}

module.export = {addImage};