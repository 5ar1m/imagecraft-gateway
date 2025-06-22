const { StatusCodes } = require('http-status-codes');
const validateEmail = require('../utils/validateEmail');
const hashPassword = require('../utils/hashPassword');
const {getUserByEmail, createUser} = require('../services/user');
const internalErr = require('../middlewares/error');
const comparePassword = require('../utils/comparePassword');
const generateToken = require('../utils/generateToken');
require('dotenv').config();

async function signIn(req, res) {
    try {
        if (!req.body){
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User Data Required' });
        }

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

async function logIn(req, res){
    try {
        if (req?.cookies?.token){
            return res.status(StatusCodes.NOT_ACCEPTABLE).json({error: 'User Already Logged In'});
        }

        if (!req.body){
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User Data Required' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing Input' });
        }

        if (!validateEmail(email) || password.length < 8) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Input' });
        }

        const userData = await getUserByEmail(email);
        if (!userData) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await comparePassword(password, userData.password);
        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ userId: userData.id });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });

        return res.status(StatusCodes.OK).json({ message: 'Login Successful' });

    } catch (err) {

        internalErr(err, req, res);
    }
}

async function logOut(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });

    } catch (err) {
        internalErr(err, req, res);
    }
}

module.exports = {signIn,  logIn, logOut};