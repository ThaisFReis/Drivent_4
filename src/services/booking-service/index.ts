import { Booking } from '@prisma/client';
import {
  invalidDataError,
  conflictError,
  notFoundError,
  cannotBookingError,
  forbiddenError,
  unauthorizedError,
} from '@/errors';
import { exclude } from '@/utils/prisma-utils';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import hotelRepository from '@/repositories/hotel-repository';

async function createBooking(userId: number, roomId: number) {
  if (!userId) throw unauthorizedError;

  if (!roomId) throw notFoundError;

  const room = await hotelRepository.findRoomById(roomId);
  if (room.capacity <= 0) throw forbiddenError;

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw invalidDataError;

  const booking = await bookingRepository.getBookingsIfHasRoom(roomId);
  if (booking.length > 0) throw conflictError;

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw cannotBookingError;

  const newBooking = await bookingRepository.createBooking(roomId, userId);

  return newBooking;
}

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw notFoundError;

  return booking;
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  if (!userId) throw unauthorizedError;
  if (!roomId) throw notFoundError;

  const room = await hotelRepository.findRoomById(roomId);

  if (!room) throw forbiddenError;

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw forbiddenError;

  if (!bookingId) throw notFoundError;

  const booking = await bookingRepository.findBookingByRoomId(roomId);
  if (booking) throw conflictError;

  const updatedBooking = await bookingRepository.updateBooking(bookingId, roomId, userId);

  return updatedBooking;
}

const bookingService = {
  createBooking,
  getBookingByUserId,
  updateBooking,
};

export default bookingService;
