import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  if (!roomId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const newBooking = await bookingService.createBooking(userId, roomId);

    // return bookingId and status 200
    return res.status(httpStatus.OK).send({
      roomId: newBooking.roomId,
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === 'CannotBookingError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function getBookingByUserId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBookingByUserId(userId);

    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: booking.roomId,
    });
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  if (!roomId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const updatedBooking = await bookingService.updateBooking(userId, roomId);

    return res.status(httpStatus.OK).send({
      roomId: updatedBooking.roomId,
    });
  } catch (error) {
    if (error.name === 'CannotBookingError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
