require('express-async-errors');
const { sequelize } = require('./model');
const express = require('express');
const bodyParser = require('body-parser');
const NotFoundError = require('./errors/not-found-error');
const jobsRouter = require('./routes/jobs');
const contractsRouter = require('./routes/contracts');
const balancesRouter = require('./routes/balances');
const adminRouter = require('./routes/admin');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

app.use(contractsRouter);
app.use(jobsRouter);
app.use(balancesRouter);
app.use(adminRouter);

app.all('*', async (req, res, next) => { throw new NotFoundError() });

module.exports = app;
