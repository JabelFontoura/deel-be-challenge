class BaseError extends Error {
  constructor(message) {
    super(message);

    Object.setPrototypeOf(this, BaseError.prototype);
  }

  serializeErrors() {
    throw new Error('Not implemented abstract method.');
  }
}

module.exports = BaseError;
