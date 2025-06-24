const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: 'Too many requests from this IP, please try again after some time',
});

module.exports = limiter;