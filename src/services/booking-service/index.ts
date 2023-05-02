import { notFoundError, cannotBookingError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketsRepository from '@/repositories/tickets-repository';
import hotelRepository from '@/repositories/hotel-repository';

async function check(roomId: number, userId: number) {
  //Enrollment
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) throw cannotBookingError;

  //Ticket
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw cannotBookingError;

  //Room
  const room = await hotelRepository.findRoomById(roomId);

  if (!room) throw notFoundError;

  const bookings = await bookingRepository.findBookingByRoomId(roomId);

  if (room.capacity <= bookings.length) throw cannotBookingError;
}

async function createBooking(userId: number, roomId: number) {
  await check(roomId, userId);

  const newBooking = await bookingRepository.createBooking(roomId, userId);

  return newBooking;
}

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw notFoundError;

  return booking;
}

async function updateBooking(roomId: number, userId: number) {
  await check(roomId, userId);

  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking || booking.id !== userId) throw cannotBookingError;

  const updatedBooking = await bookingRepository.updateBooking(booking.id, roomId, userId);

  return updatedBooking;
}

const bookingService = {
  createBooking,
  getBookingByUserId,
  updateBooking,
};

export default bookingService;
