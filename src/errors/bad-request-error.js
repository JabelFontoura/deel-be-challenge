const BaseError = require('./base-error');

class BadRequestError extends BaseError {
  statusCode = 400;
  message = '';

  constructor(message) {
    super(message);
    this.message = message;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

module.exports = BadRequestError;
