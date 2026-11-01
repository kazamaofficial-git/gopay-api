'use strict';

const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error-handler');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy);

app.use((_req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
  next();
});
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/favicon.ico', (_req, res) => res.redirect(301, '/assets/favicon-32.png'));
app.use(routes);
app.use(express.static(config.publicDir, { extensions: ['html'], maxAge: '1h' }));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
