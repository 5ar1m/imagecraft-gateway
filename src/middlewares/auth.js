const verifyToken = require('../utils/verifyToken');
const { StatusCodes } = require('http-status-codes');
const internalErr = require('../middlewares/error');
require('dotenv').config();

async function authMiddleware(req, res, next) {
  try {
    const token = req?.cookies?.token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.userData = decoded;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Expired Token' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid Token' });
    } else {
      return internalErr(err, req, res);
    }
  }
}

module.exports = authMiddleware;