import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createBooking, getBookingByUserId, updateBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter
  .all('/*', authenticateToken)
  .post('/', createBooking)
  .get('/', getBookingByUserId)
  .put('/:bookingId', updateBooking);

export { bookingRouter };
