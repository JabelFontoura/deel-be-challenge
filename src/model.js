const Sequelize = require('sequelize');
const profileType = require('./enums/profile.type');
const contractStatus = require('./enums/contract-status');
const { Op } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'TEST' ? ':memory:' : './database.sqlite3',
});

class Profile extends Sequelize.Model {
  payJob(contractor, job) {
    this.balance = this.balance - job.price;
    contractor.balance = contractor.balance + job.price;

    job.pay();
  }

  isClient() {
    return this.type === profileType.CLIENT;
  }

  deposit(amount) {
    this.balance = parseFloat((this.balance + amount).toFixed(2));
  }

  async canDeposit(amount) {
    const jobSum = await Job.sum('price', {
      where: { paid: false },
      include: [
        {
          model: Contract,
          required: true,
          attributes: [],
          where: {
            status: { [Op.not]: contractStatus.TERMINATED },
            ClientId: this.id,
          },
        },
      ],
    });

    const threshold = jobSum * 0.25;

    return amount <= threshold;
  }
}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2),
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
    },
  },
  {
    sequelize,
    modelName: 'Profile',
  }
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated'),
    },
  },
  {
    sequelize,
    modelName: 'Contract',
  }
);

class Job extends Sequelize.Model {
  pay() {
    this.paid = true;
    this.paymentDate = new Date().toISOString();
  }
}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  }
);

Profile.hasMany(Contract, { as: 'Contractor', foreignKey: 'ContractorId' });
Contract.belongsTo(Profile, { as: 'Contractor' });
Profile.hasMany(Contract, { as: 'Client', foreignKey: 'ClientId' });
Contract.belongsTo(Profile, { as: 'Client' });
Contract.hasMany(Job);
Job.belongsTo(Contract);

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job,
};
