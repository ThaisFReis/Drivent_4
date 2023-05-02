import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createBooking,
  createEnrollmentWithAddress,
  createhAddressWithCEP,
  createEvent,
  createPayment,
  generateCreditCardData,
  createHotel,
  createRoomWithHotelId,
  createSession,
  createTicketType,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createUser,
} from '../factories';
import app, { init } from '@/app';
import { prisma } from '@/config';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

//Supertest
const server = supertest(app);

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const token = '';

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 200 if has a valid body', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      //Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.OK);
    });

    it('should respond with status 404 if roomId not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: room.id + 10,
        });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if user has no enrollment', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user not paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user has no space in room', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      await createBooking({ roomId: room.id, userId: user.id });
      await createBooking({ roomId: room.id, userId: user.id });
      await createBooking({ roomId: room.id, userId: user.id });

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const token = '';

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 200 if has a valid body', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      //Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.OK);
    });

    it('should respond with status 404 if roomId not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server
        .get('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: room.id + 10,
        });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if user has no enrollment', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user not paid ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user has no space in room', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      await createBooking({ roomId: room.id, userId: user.id });
      await createBooking({ roomId: room.id, userId: user.id });
      await createBooking({ roomId: room.id, userId: user.id });

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`).send({
        roomId: room.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe('PUT /booking/bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const token = '';

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 200 if has a valid body', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      //Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({ roomId: room.id, userId: user.id });

      const changeRoom = await createRoomWithHotelId(hotel.id);

      const response = await server.put('/booking/${booking.id}').set('Authorization', `Bearer ${token}`).send({
        bookingId: booking.id,
        roomId: changeRoom.id,
      });

      expect(response.status).toBe(httpStatus.OK);
    });

    it('should respond with status 404 if bookingId not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({ roomId: room.id, userId: user.id });

      const changeRoom = await createRoomWithHotelId(hotel.id);

      const response = await server.put('/booking/0').set('Authorization', `Bearer ${token}`).send({
        roomId: changeRoom.id,
      });

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 if roomId not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({ roomId: room.id, userId: user.id });

      const response = await server
        .put('/booking/${booking.id}')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roomId: room.id + 10,
        });

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if room has no space', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const changeRoom = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({ roomId: room.id, userId: user.id });
      await createBooking({ roomId: changeRoom.id, userId: user.id });
      await createBooking({ roomId: changeRoom.id, userId: user.id });
      await createBooking({ roomId: changeRoom.id, userId: user.id });

      const response = await server.put('/booking/${booking.id}').set('Authorization', `Bearer ${token}`).send({
        roomId: changeRoom.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if booking is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      await createPayment(ticket.id, ticketType.price);

      // Hotel
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const changeRoom = await createRoomWithHotelId(hotel.id);

      const booking = await createBooking({ roomId: room.id, userId: user.id });

      const response = await server.put('/booking').set('Authorization', `Bearer ${token}`).send({
        bookingId: booking.id,
        roomId: changeRoom.id,
      });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
  });
});
