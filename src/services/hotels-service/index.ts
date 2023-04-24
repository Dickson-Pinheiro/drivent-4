import ticketService from '../tickets-service';
import { notFoundError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-reopsitory';

async function getHotels(userId: number) {
  try {
    const ticket = await ticketService.getTicketByUserId(userId);
    if (ticket.status === 'RESERVED') {
      throw { name: 'paymentRequired' };
    }
    if (ticket.TicketType.isRemote) {
      throw { name: 'paymentRequired' };
    }
    if (!ticket.TicketType.includesHotel) {
      throw { name: 'paymentRequired' };
    }
    const hotels = await hotelsRepository.getHotels();
    return hotels;
  } catch (error) {
    throw error;
  }
}

async function getHotelById(hotelId: number, userId: number) {
  try {
    const ticket = await ticketService.getTicketByUserId(userId);
    if (ticket.status === 'RESERVED') {
      throw { name: 'paymentRequired' };
    }
    if (ticket.TicketType.isRemote) {
      throw { name: 'paymentRequired' };
    }
    if (!ticket.TicketType.includesHotel) {
      throw { name: 'paymentRequired' };
    }
    const hotel = await hotelsRepository.getHotelById(hotelId);
    if (!hotel) {
      throw notFoundError();
    }
    return hotel;
  } catch (error) {
    throw error;
  }
}

const hotelsService = {
  getHotels,
  getHotelById,
};

export default hotelsService;
