// for otp authentication
const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');

class AuthController {
    async sendOtp(req, res) {
        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ message: 'Phone Field is required' })
        }

        const otp = await otpService.generateOtp();

        // Hash
        const ttl = 1000 * 60 * 2 // time to leave (2 min) (in ms)
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`
        const hash = hashService.hashOtp(data); //hash will be made of phone,otp,expires combined

        // Sending OTP
        try {
            await otpService.sendBySms(phone, otp);

            res.json({
                hash: `${hash}.${expires}`,
                phone,
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'message sending failed' })
        }

    }

    async verifyOtp(req, res) {
        const { otp, hash, phone } = req.body;
        if (!otp || !hash || !phone) {
            res.status(400).json({ message: "All fields are required" })
        }

        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) { // expires is string, +expires converts into number
            res.status(400).json({ message: "OTP expired :(" })
        }

        const data = `${phone}.${otp}.${expires}`
        const isValid = otpService.verifyOtp(hashedOtp, data)

        if (!isValid) {
            res.status(400).json({ message: 'Invalid OTP :(' })
        }

        let user;

        try {
            user = await userService.findUser({ phone: phone }); // check if the user already exists
            if (!user) { // if no user exits, create new user
                user = await userService.createUser({ phone: phone });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Database Error' });
        }

        // Token
        const { accessToken, refreshToken } = tokenService.generateTokens({ _id: user._id, activated: false });

        // store refreshToken in database
        await tokenService.storeRefreshToken(refreshToken, user._id)

        // attach refreshToken & accessToken to a http only cookie (=> js in client side can't read it) & automatically sent for every request (since its a cookie)
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // in ms (30 days)
            httpOnly: true
        })
        res.cookie('accesstoken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // in ms (30 days)
            httpOnly: true
        })

        const userDto = new UserDto(user); // tranforming to get only the required data in user
        res.json({ user: userDto, auth: true })
    }

    async refresh(req, res) {
        // get refresh token from cookie
        const { refreshtoken: refreshTokenFromCookie } = req.cookies; // : => rename/aliasing it as ..

        // check if token is valid
        let userData;
        try {
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie)
        } catch (err) {
            return res.status(401).json({ message: 'Invalid Token' })
        }

        // check if token is in database
        try {
            const token = tokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            )

            if (!token) {
                return res.status(401).json({ message: 'Token nahi mila' })
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal Error' })
        }

        // check if valid user
        const user = await userService.findUser({ _id: userData._id })
        if (!user) {
            return res.status(404).json({ message: 'No user found' })
        }

        // generate new tokens (both access & refresh)
        const { accessToken, refreshToken } = tokenService.generateTokens({ _id: userData._id })
        
        // update with new refresh token
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken)
        } catch (err) {
            return res.status(500).json({ message: 'Internal Error' })
        }

        // put in cookie
        res.cookie('refreshtoken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // in ms (30 days)
            httpOnly: true
        })
        res.cookie('accesstoken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30, // in ms (30 days)
            httpOnly: true
        })

        // send response to user
        const userDto = new UserDto(user); // tranforming to get only the required data in user
        res.json({ user: userDto, auth: true })
    }

    async logout(req, res) {
        const { refreshtoken } = req.cookies
        
        // delete refresh token from database
        await tokenService.removeToken(refreshtoken)
        
        // delete cookies
        res.clearCookie('refreshtoken')
        res.clearCookie('accesstoken')

        // send response
        res.json({user: null, auth: false})
    }
}

module.exports = new AuthController(); //exporting object