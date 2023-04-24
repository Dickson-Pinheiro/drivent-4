import { Response } from 'express';
import hotelsService from '@/services/hotels-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotels(userId);
    return res.send(hotels);
  } catch (error) {
    switch (error.name) {
      case 'paymentRequired':
        res.status(402).send();
        break;
      case 'NotFoundError':
        res.status(404).send();
        break;
      default:
        res.status(400).send();
        break;
    }
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;
  try {
    const hotels = await hotelsService.getHotelById(Number(hotelId), userId);
    return res.send(hotels);
  } catch (error) {
    switch (error.name) {
      case 'paymentRequired':
        res.status(402).send();
        break;
      case 'NotFoundError':
        res.status(404).send();
        break;
      default:
        res.status(400).send();
        break;
    }
  }
}
