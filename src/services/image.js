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

async function getImageById(imageId) {
  return await prisma.image.findUnique({
    where: { id: imageId },
  });
}

async function getAllImagesByUser(userId) {
  return await prisma.image.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

module.exports = {addImage, getImageById, getImageById};