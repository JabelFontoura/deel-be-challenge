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
    price: 200,
    ContractId: 1,
    paid: true,
    paymentDate: '2022-09-15',
    createdAt: '2022-09-15',
  },
  {
    id: 2,
    description: 'job 1',
    price: 200,
    ContractId: 2,
    paid: true,
    paymentDate: '2022-09-15',
    createdAt: '2022-09-15',
  },
  {
    id: 3,
    description: 'job 1',
    price: 200,
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

  it('should return profession with the highest income within given time range', async () => {
    const { statusCode, body } = await request(app)
      .get('/admin/best-profession')
      .set('profile_id', '1')
      .query({ start: '2022-09-14' })
      .query({ end: '2022-09-16' });

    expect(statusCode).toEqual(200);
    expect(body).toEqual(
      expect.objectContaining({
        profession: 'Profession 2',
      })
    );
  });

  it('should return null if there are no jobs within given in the time range', async () => {
    const { statusCode, body } = await request(app)
      .get('/admin/best-profession')
      .set('profile_id', '1')
      .query({ start: '2022-09-16' })
      .query({ end: '2022-09-16' });

    expect(statusCode).toEqual(200);
    expect(body).toBeNull();
  });

  it('should return empty array if there are no jobs within given in the time range', async () => {
    const { statusCode, body } = await request(app)
      .get('/admin/best-clients')
      .set('profile_id', '1')
      .query({ start: '2022-09-16' })
      .query({ end: '2022-09-16' })
      .query({ limit: 10 });

    expect(statusCode).toEqual(200);
    expect(body).toEqual([]);
  });

  it('should return list of clients who paid most within given time range', async () => {
    const { statusCode, body } = await request(app)
      .get('/admin/best-clients')
      .set('profile_id', '1')
      .query({ start: '2022-09-14' })
      .query({ end: '2022-09-16' })
      .query({ limit: 10 });

    expect(statusCode).toEqual(200);
    expect(body).toEqual([
      { fullName: 'Firt name 1 Last name 1', id: 1, paid: 600 },
    ]);
  });
});
