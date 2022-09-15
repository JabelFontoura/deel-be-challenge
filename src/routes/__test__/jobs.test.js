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
    status: 'in_progress',
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

describe('jobs', () => {
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

  it('should return only unpaid jobs', async () => {
    const { statusCode, body } = await request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '1');

    expect(statusCode).toEqual(200);
    expect(body).toHaveLength(1);
    expect(body[0].ContractId).toEqual(jobs[0].ContractId);
  });
});
