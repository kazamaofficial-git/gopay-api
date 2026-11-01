'use strict';

const config = require('../config');

// qrisId -> order checkout QRIS (in-memory)
const orders = new Map();

const create = (order) => orders.set(order.id, order) && order;
const get = (id) => orders.get(id) || null;
const isExpired = (order) => Date.now() > order.expiresAt.getTime();

function startCleanup() {
  const timer = setInterval(() => {
    const cutoff = Date.now() - config.qris.purgeAfterMs;
    for (const [id, order] of orders) {
      if (order.expiresAt.getTime() < cutoff) orders.delete(id);
    }
  }, config.qris.purgeAfterMs);
  timer.unref();
}

module.exports = { create, get, isExpired, startCleanup };
