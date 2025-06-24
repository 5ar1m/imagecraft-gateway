const prisma = require('../prisma/client');

async function addImage(data) {
  return await prisma.image.create({
    data: {
      name: data.name,
      mimeType: data.mimeType,
      userId: data.userId,
    },
  });
}

module.exports = {addImage};