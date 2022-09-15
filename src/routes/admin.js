const express = require('express');
const { Job, Profile, Contract, sequelize } = require('../model');
const { Op } = require('sequelize');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

/**
 * @returns best profession by time range
 */
router.get('/admin/best-profession', getProfile, async (req, res) => {
  const { start, end } = req.query;

  const job = await Job.findOne({
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'totalPaid']],
    order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
    group: ['Contract.Contractor.profession'],
    where: {
      paid: true,
      createdAt: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: Contract,
        attributes: ['createdAt'],
        include: [
          {
            model: Profile,
            as: 'Contractor',
            where: { type: 'contractor' },
            attributes: ['profession'],
          },
        ],
      },
    ],
  });

  res.json(
    !job
      ? null
      : {
          profession: job.Contract.Contractor.profession,
        }
  );
});

/**
 * @returns best clients by time range
 */
router.get('/admin/best-clients', getProfile, async (req, res) => {
  const { start, end, limit } = req.query;
  const results = await Job.findAll({
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'paid']],
    order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
    group: ['Contract.Client.id'],
    limit,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [start, end],
      },
    },
    include: [
      {
        model: Contract,
        attributes: ['id'],
        include: [
          {
            model: Profile,
            as: 'Client',
            where: { type: 'client' },
            attributes: ['id', 'firstName', 'lastName'],
          },
        ],
      },
    ],
  });

  res.send(
    results.map((x) => ({
      paid: x.paid,
      id: x.Contract.Client.id,
      fullName: `${x.Contract.Client.firstName} ${x.Contract.Client.lastName}`,
    }))
  );
});

module.exports = router;
