const { StatusCodes } = require('http-status-codes');
const internalErr = require('../middlewares/error.js');
const path = require('path');

async function root(req, res) {
    try {
        return res.status(StatusCodes.OK).sendFile(path.join(__dirname, '..', 'public', 'docs.html'));
    } catch(err) {
        internalErr(err, req, res);
    }
}

module.exports = root;