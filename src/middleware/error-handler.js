const BaseError = require('../errors/base-error');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV == 'DEV') console.log(err);

  if (err.constructor.prototype instanceof BaseError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({ errors: [{ message: 'Something went wrong!' }] });
};

module.exports = errorHandler;
