const { StatusCodes } = require('http-status-codes');
const validateEmail = require('../utils/validateEmail');
const hashPassword = require('../utils/hashPassword');
const {getUserByEmail, createUser} = require('../services/user');
const internalErr = require('../middlewares/error');

async function signIn(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing Input' });
        }

        if (!validateEmail(email) || password.length < 8) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Input' });
        }

        const hashedPassword = await hashPassword(password);

        const userData = await createUser({
            name,
            email,
            password: hashedPassword,
        });

        return res.status(StatusCodes.CREATED).json({
            id: userData.id, 
            name: userData.name, 
            email: userData.email,
            createdAt: userData.createdAt
        });
    } catch (err) {
        if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
            return res.status(StatusCodes.CONFLICT).json({ error: 'Email already in use' });
        }

        internalErr(err, req, res);
    }
}

module.exports = {signIn};