const jwt = require('jsonwebtoken');
const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET
class TokenService {
    generateTokens(payload) {
        // jwt/access token
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1h' // 1 hour
        })

        // refresh token
        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y' // 1 year
        })

        return { accessToken, refreshToken }
    }
}

module.exports = new TokenService();