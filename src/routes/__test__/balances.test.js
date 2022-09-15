const request = require('supertest');
const app = require('../../app');
const profileType = require('../../enums/profile.type');
const { Profile, Contract, Job } = require('../../model');

const profiles = [
  {
    id: 1,
    firstName: 'Firt name 1',
    lastName: 'Last name 1',
    profession: 'Profession 1',
    balance: 100,
    type: profileType.CLIENT,
  },
  {
    id: 2,
    firstName: 'Firt name 2',
    lastName: 'Last name 2',
    profession: 'Profession 2',
    balance: 100,
    type: profileType.CONTRACTOR,
  },
  {
    id: 3,
    firstName: 'Firt name 3',
    lastName: 'Last name 3',
    profession: 'Profession 3',
    balance: 100,
    type: profileType.CONTRACTOR,
  },
];

const contracts = [
  {
    id: 1,
    terms: 'terms 1',
    status: 'new',
    ClientId: 1,
    ContractorId: 2,
  },
  {
    id: 2,
    terms: 'terms 2',
    status: 'new',
    ClientId: 1,
    ContractorId: 2,
  },
  {
    id: 3,
    terms: 'terms 3',
    status: 'new',
    ClientId: 1,
    ContractorId: 3,
  },
];

const jobs = [
  {
    id: 1,
    description: 'job 1',
    price: 100,
    ContractId: 1,
    paid: false,
    paymentDate: '2022-09-15',
    createdAt: '2022-09-15',
  },
  {
    id: 2,
    description: 'job 1',
    price: 100,
    ContractId: 2,
    paid: true,
    paymentDate: '2022-09-15',
    createdAt: '2022-09-15',
  },
  {
    id: 3,
    description: 'job 1',
    price: 100,
    ContractId: 3,
    paid: true,
    paymentDate: '2022-09-15',
    createdAt: '2022-09-15',
  },
];

describe('admin', () => {
  beforeAll(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });

    await Promise.all([
      Profile.bulkCreate(profiles),
      Contract.bulkCreate(contracts),
      Job.bulkCreate(jobs),
    ]);
  });

  it('should return 400 if client is not found', async () => {
    const { statusCode } = await request(app)
      .post('/balances/deposit/100')
      .set('profile_id', '1')
      .send({ amount: 100 });

    expect(statusCode).toEqual(400);
  });

  it('should return 400 if given user is not a client', async () => {
    const { statusCode } = await request(app)
      .post('/balances/deposit/2')
      .set('profile_id', '1')
      .send({ amount: 100 });

    expect(statusCode).toEqual(400);
  });

  it('should return 400 if deposit exceeds the threshold of 25% of unpaid jobs sum', async () => {
    const { statusCode, body } = await request(app)
      .post('/balances/deposit/1')
      .set('profile_id', '1')
      .send({ amount: 1000 });

    expect(statusCode).toEqual(400);
  });

  it('should increase clients balance', async () => {
    const { statusCode, body } = await request(app)
      .post('/balances/deposit/1')
      .set('profile_id', '1')
      .send({ amount: 10 });

    expect(statusCode).toEqual(200);
    expect(body).toEqual(expect.objectContaining({ id: 1, balance: 110 }));
  });
});
