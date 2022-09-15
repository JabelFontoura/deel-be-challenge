const express = require('express');
const { Op } = require('sequelize');
const { getProfile } = require('../middleware/getProfile');
const { Job, Contract, Profile, sequelize } = require('../model');
const contractStatus = require('../enums/contract-status');
const BadRequestError = require('../errors/bad-request-error');
require('express-async-errors');

const router = express.Router();

/**
 * @returns unpaid jobs for active contracts
 */
router.get('/jobs/unpaid', getProfile, async (req, res) => {
  const userId = req.profile.id;

  const jobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        required: true,
        attributes: [],
        where: {
          [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
          status: contractStatus.IN_PROGRESS,
        },
      },
    ],
  });

  res.json(jobs);
});

/**
 * @returns pay job with job_id
 */
router.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const userId = req.profile.id;
    const jobId = req.params.job_id;

    const job = await Job.findOne(
      {
        where: { id: jobId },
        include: [
          {
            model: Contract,
            required: true,
            attributes: ['ContractorId'],
            where: { ClientId: userId },
          },
        ],
      },
      { transaction: t }
    );

    if (!job || job.paid)
      throw new BadRequestError(
        job.paid ? 'Job already paid' : 'Job not found'
      );

    const client = await Profile.findByPk(userId, { transaction: t });
    if (client.balance < job.price)
      throw new BadRequestError('Insufficient funds');

    const contractor = await Profile.findByPk(job.Contract.ContractorId, {
      transaction: t,
    });

    client.payJob(contractor, job);

    await Promise.all([
      client.save({ transaction: t }),
      contractor.save({ transaction: t }),
      job.save({ transaction: t }),
    ]);

    return job;
  });

  res.send({ result });
});

module.exports = router;
