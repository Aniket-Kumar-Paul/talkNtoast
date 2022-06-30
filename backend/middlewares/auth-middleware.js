const tokenService = require("../services/token-service");

module.exports = async function(req, res, next) {
    try {
        const { accesstoken } = req.cookies;
        if (!accesstoken) {
            throw new Error()
        }
        
        const userData = await tokenService.verifyAccessToken(accesstoken)
        console.log(`userData: ${userData}`) // gives _id, activated, iat, exp
        if (!userData) {
            throw new Error();
        }

        req.user = userData // attach userData with the request
        next() // if valid, go to next (passes the middleware)
    } catch (err) {
        res.status(401).json({message: 'Invalid Token'})
    }
    // next()
}