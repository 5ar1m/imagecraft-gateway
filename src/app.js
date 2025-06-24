const express = require('express');
const app = express();
const userRoutes = require('./routes/user');
const rootRoute = require('./routes/root');
const imageRoutes = require('./routes/image');
const cookieParser = require('cookie-parser');
const auth = require('./middlewares/auth');
const limiter = require('./middlewares/rateLimit');


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use('/', rootRoute);
app.use('/user', userRoutes);
app.use('/image', auth, imageRoutes);

module.exports = app;