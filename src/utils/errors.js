'use strict';

class AppError extends Error {
  constructor(status, message, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

const badRequest = (message) => new AppError(400, message, 'BAD_REQUEST');

module.exports = { AppError, badRequest };
