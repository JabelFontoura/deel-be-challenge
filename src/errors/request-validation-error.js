const BaseError = require('./base-error');

class RequestValidationError extends BaseError {
  statusCode = 400;
  errors = [];

  constructor(errors) {
    super('Invalid request');
    this.errors = errors;

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((e) => {
      return { message: e.msg, field: e.param };
    });
  }
}

module.exports = RequestValidationError;
