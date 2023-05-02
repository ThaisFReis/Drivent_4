import { prisma } from '@/config';

async function createBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function getBookingsIfHasRoom(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
  });
}

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findFirst({
    where: {
      roomId,
    },
  });
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
      userId,
    },
  });
}

const bookingRepository = {
  createBooking,
  getBookingsIfHasRoom,
  findBookingByUserId,
  findBookingByRoomId,
  updateBooking,
};

export default bookingRepository;
