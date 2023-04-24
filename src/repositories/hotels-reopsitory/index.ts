import { prisma } from '@/config';

async function getHotels() {
  return prisma.hotel.findFirst({
    include: {
      Rooms: true,
    },
  });
}

async function getHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

const hotelsRepository = {
  getHotels,
  getHotelById,
};

export default hotelsRepository;
