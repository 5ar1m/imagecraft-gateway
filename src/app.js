const express = require('express');
const app = express();
const userRoutes = require('./routes/user');

app.use('/user', userRoutes);

module.exports = app;