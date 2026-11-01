'use strict';

const config = require('../config');

const entries = [];
let sequence = 0;

function write(type, message, details = null) {
  const timestamp = new Date().toISOString();
  entries.unshift({ id: ++sequence, timestamp, type, message, details });
  if (entries.length > config.logs.max) entries.pop();
  console.log(`[${timestamp}] [${type}] ${message}`);
}

module.exports = {
  system: (message, details) => write('SYSTEM', message, details),
  info: (message, details) => write('INFO', message, details),
  success: (message, details) => write('SUCCESS', message, details),
  warn: (message, details) => write('WARNING', message, details),
  error: (message, details) => write('ERROR', message, details),
  list: () => entries.slice(),
};
