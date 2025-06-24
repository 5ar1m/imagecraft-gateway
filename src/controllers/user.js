const { StatusCodes } = require('http-status-codes');
const validateEmail = require('../utils/validateEmail');
const hashPassword = require('../utils/hashPassword');
const {getUserByEmail, createUser, getUserById, updateVerification} = require('../services/user');
const internalErr = require('../middlewares/error');
const comparePassword = require('../utils/comparePassword');
const generateToken = require('../utils/generateToken');
const verifyEmailToken = require('../utils/verifyEmailToken');
const generateEmailToken = require('../utils/generateEmailToken');
const sendVerificationEmail = require('../config/mail');
const Redis = require('ioredis');
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

async function logIn(req, res) {
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

        if (!userData.isVerified) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Verify your email to login' });
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

const redis = new Redis();

async function initiateVerification(req, res) {
    try {
        if (!req.body){
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'User Data Required' });
        }

        const { email } = req.body;

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing Input' });
        }

        if (!validateEmail(email)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid Input' });
        }

        const exists = await redis.get(email);

        if (exists) {
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                message: 'You can request verification Link only once every 15 minutes.',
            });
        }

        await redis.set(email, '1', 'EX', 15 * 60);

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User is already verified' });
        }

        const token = generateEmailToken({ userId: user.id });
        
        await sendVerificationEmail(email, token);

        return res.status(StatusCodes.OK).json({ message: 'Verification email sent' });

    } catch (err) {
        
        internalErr(err, req, res);
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        const decoded = verifyEmailToken(token);
        const userId = decoded.userId;

        const user = await getUserById(userId);

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Invalid Link' });
        }

        if (user.isVerified) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User is already verified' });
        }

        await updateVerification(userId);

        return res.status(StatusCodes.OK).json({ message: 'User verified successfully' });

    } catch (err) {

        if (err.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Expired Link' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid Link' });
        } else {
            return internalErr(err, req, res);
        }
    }
}

module.exports = {signIn,  logIn, logOut, initiateVerification, verifyEmail};