import { prisma } from '@/config';

async function createBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true,
    },
  });
}

async function findBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId,
    },
    include: {
      Room: true,
    },
  });
}

async function updateBooking(id: number, roomId: number, userId: number) {
  return prisma.booking.update({
    where: {
      id,
    },
    data: {
      roomId,
      userId,
    },
  });
}

const bookingRepository = {
  createBooking,
  findBookingByUserId,
  findBookingByRoomId,
  updateBooking,
};

export default bookingRepository;
