import supertest from 'supertest';

import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import { cleanDb } from '../helpers';
import {
  createUser,
  createEnrollmentWithAddress,
  createTicketType,
  createTicket,
  createHotel,
  createRoom,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

afterEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels').set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 404 if not exists enrollment', async () => {
    const user = await createUser({ password: '123456' });
    console.log(user);
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });
    console.log(login.body);

    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 if not exists ticket', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    await createEnrollmentWithAddress(user);

    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });

    expect(hotelsResult.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 402 if ticket is not paid', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, 'RESERVED');
    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 402 if ticket is remote', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ isRemote: true });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 402 if ticket not includes hotel', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ includesHotel: false });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 200 and hotels data if its ok', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ includesHotel: true, isRemote: false });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelData = {
      name: 'Hotel legal',
      image: 'https://github.com/Dickson-Pinheiro.png',
    };
    const hotel = await createHotel(hotelData);
    await createRoom({ capacity: 2, hotelId: hotel.id, name: 'Quarto legal' });
    const hotelsResult = await server.get('/hotels').set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(200);
    expect(hotelsResult.body).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      image: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      Rooms: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });
});

describe('GET /hotels/hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels').set({ Authorization: `Bearer ${token}` });
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 404 if not exists enrollment', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const hotelsResult = await server.get(`/hotels/${1}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 if not exists ticket', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    await createEnrollmentWithAddress(user);

    const hotelsResult = await server.get(`/hotels/${1}`).set({ Authorization: `Bearer ${login.body.token}` });

    expect(hotelsResult.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 402 if ticket is not paid', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, 'RESERVED');
    const hotelsResult = await server.get(`/hotels/${1}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 402 if ticket is remote', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ isRemote: true, includesHotel: false });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelsResult = await server.get(`/hotels/${1}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 402 if ticket not includes hotel', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ includesHotel: false, isRemote: false });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelsResult = await server.get(`/hotels/${1}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(402);
  });

  it('should respond with status 200 and hotels data if its ok', async () => {
    const user = await createUser({ password: '123456' });
    const login = await server.post('/auth/sign-in').send({
      email: user.email,
      password: '123456',
    });

    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType({ includesHotel: true, isRemote: false });
    await createTicket(enrollment.id, ticketType.id, 'PAID');
    const hotelData = {
      name: 'Hotel legal',
      image: 'https://github.com/Dickson-Pinheiro.png',
    };
    const hotel = await createHotel(hotelData);
    await createRoom({ capacity: 2, hotelId: hotel.id, name: 'Quarto legal' });
    const hotelsResult = await server.get(`/hotels/${hotel.id}`).set({ Authorization: `Bearer ${login.body.token}` });
    expect(hotelsResult.status).toBe(200);
    expect(hotelsResult.body).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      image: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      Rooms: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ]),
    });
  });
});
