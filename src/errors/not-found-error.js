const BaseError = require('./base-error');

class NotFoundError extends BaseError {
  statusCode = 404;

  constructor() {
    super('Route not found.');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Route not found' }];
  }
}

module.exports = NotFoundError;
