import { prisma } from '@/config';

type BookingFactoryType = {
  userId: number;
  roomId: number;
};
// Create Booking
export async function createBooking({ userId, roomId }: BookingFactoryType) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId,
    },
  });
}
