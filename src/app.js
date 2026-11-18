require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
