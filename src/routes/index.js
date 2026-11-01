'use strict';

const { Router } = require('express');

const router = Router();
router.use(require('./system.routes'));
router.use(require('./qris.routes'));
router.use(require('./payment.routes'));

module.exports = router;
