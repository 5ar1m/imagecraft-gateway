const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', userRoutes);

module.exports = app;