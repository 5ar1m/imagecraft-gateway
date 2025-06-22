const { StatusCodes } = require('http-status-codes');

async function internalErr(err, req, res) {
    console.log(err.stack);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Something Went Wrong' });
}

module.exports = internalErr;