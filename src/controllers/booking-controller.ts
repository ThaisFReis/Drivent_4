import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const newBooking = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.CREATED).json(newBooking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'InvalidDataError') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    if (error.name === 'ConflictError') {
      return res.sendStatus(httpStatus.CONFLICT);
    }
    if (error.name === 'CannotBookingError') {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
  }
}

export async function getBookingByUserId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBookingByUserId(userId);

    return res.status(httpStatus.OK).json(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const updatedBooking = await bookingService.updateBooking(userId, roomId);

    return res.status(httpStatus.OK).json(updatedBooking);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'ConflictError') {
      return res.sendStatus(httpStatus.CONFLICT);
    }
  }
}
