const express = require('express');
const validateRequest = require('../middleware/validate-request');
const BadRequestError = require('../errors/bad-request-error');
const { Profile, sequelize } = require('../model');
const { getProfile } = require('../middleware/getProfile');
const { body } = require('express-validator');
require('express-async-errors');

const router = express.Router();

/**
 * @returns deposit for userId
 */
router.post(
  '/balances/deposit/:userId',
  [
    body('amount')
      .notEmpty()
      .isDecimal()
      .withMessage('Amount must be valid decimal.'),
  ],
  getProfile,
  validateRequest,
  async (req, res) => {
    const result = await sequelize.transaction(async (t) => {
      const { amount } = req.body;
      const { userId } = req.params;
      const profile = await Profile.findByPk(userId, { transaction: t });

      if (!profile || !profile.isClient())
        throw new BadRequestError('Client not found');

      if (!(await profile.canDeposit(amount)))
        throw new BadRequestError('Deposit threshold exceeded!');

      profile.deposit(amount);

      await profile.save({ transaction: t });

      return profile;
    });

    res.send(result);
  }
);

module.exports = router;
