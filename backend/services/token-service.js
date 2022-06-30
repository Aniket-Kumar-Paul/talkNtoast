const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh-model')
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET

class TokenService {
    generateTokens(payload) {
        // jwt/access token
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1m' // 1 min
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

    async verifyAccessToken(accessToken) {
        return jwt.verify(accessToken, accessTokenSecret)
    }

    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, refreshTokenSecret)
    }

    async findRefreshToken(userId, refreshToken) {
        return await refreshModel.findOne({ userId: userId, token: refreshToken })
    }

    async updateRefreshToken(userId, refreshToken) {
        return await refreshModel.updateOne({ userId: userId }, { token: refreshToken }) // (filter to find required data/object, what to update)
    }

    async removeToken(refreshToken) {
        return await refreshModel.deleteOne({ token: refreshToken })
    }
}

module.exports = new TokenService();