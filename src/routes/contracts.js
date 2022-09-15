const express = require('express');
const contractStatus = require('../enums/contract-status');
const { getProfile } = require('../middleware/getProfile');
const { Contract } = require('../model');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @returns contract by id
 */
router.get('/contracts/:id', getProfile, async (req, res) => {
  const { id } = req.params;
  const userId = req.profile.id;

  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
    },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
});

/**
 * @returns non termidated contracts from profile_id
 */
router.get('/contracts', getProfile, async (req, res) => {
  const userId = req.profile.id;

  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [{ ClientId: userId }, { ContractorId: userId }],
      status: { [Op.not]: contractStatus.TERMINATED },
    },
  });

  res.json(contracts);
});

module.exports = router;
