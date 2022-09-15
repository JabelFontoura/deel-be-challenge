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
    lastName: 'Last name 1',
    profession: 'Profession 2',
    balance: 100,
    type: profileType.CONTRACTOR,
  },
];

const contracts = [
  {
    id: 1,
    terms: 'terms 1',
    status: 'terminated',
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
];

describe('contracts', () => {
  beforeAll(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });

    await Promise.all([
      Profile.bulkCreate(profiles),
      Contract.bulkCreate(contracts),
    ]);
  });

  it('should return 404 if contract not found', async () => {
    await request(app).get('/contracts/99').set('profile_id', '1').expect(404);
  });

  it('should return 401 if profile_id header is not equal to client or contractor', async () => {
    await request(app).get('/contracts/1').set('profile_id', '99').expect(401);
  });

  it('should return contract when profile_id is equal to contractor', async () => {
    const { statusCode, body } = await request(app)
      .get('/contracts/1')
      .set('profile_id', '1');

    expect(statusCode).toEqual(200);
    expect(body).toMatchObject(contracts[0]);
  });

  it('should return contract when profile_id is equal to client', async () => {
    const { statusCode, body } = await request(app)
      .get('/contracts/1')
      .set('profile_id', '1');

    expect(statusCode).toEqual(200);
    expect(body).toMatchObject(contracts[0]);
  });

  it('should return no terminated contracts for profile_id', async () => {
    const { statusCode, body } = await request(app)
      .get('/contracts')
      .set('profile_id', '1');

    expect(statusCode).toEqual(200);
    expect(body).toContainEqual(expect.objectContaining(contracts[1]));
  });
});
