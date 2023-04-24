import { Hotel, Room } from '@prisma/client';

import { prisma } from '@/config';

export async function createHotel(hotel: Partial<Hotel>) {
  return prisma.hotel.create({
    data: {
      image: hotel.image,
      name: hotel.name,
    },
  });
}

export async function createRoom(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) {
  return prisma.room.create({
    data: room,
  });
}
