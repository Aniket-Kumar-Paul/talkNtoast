const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh-model')
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET

class TokenService {
    generateTokens(payload) {
        // jwt/access token
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1h' // 1 hour
        })

        // refresh token - store new refresh token in database when user logs in & delete it when logs out
        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y' // 1 year
        })

        return { accessToken, refreshToken }
    }

    async storeRefreshToken(token, userId) {
        try {
            await refreshModel.create({
                token,
                userId
            })
        } catch (err) {
            console.log(err.message)
        }
    }

    async verifyAccessToken(token) {
        return jwt.verify(token, accessTokenSecret)
    }
}

module.exports = new TokenService();