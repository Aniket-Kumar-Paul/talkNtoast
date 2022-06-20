const crypto = require('crypto');
const { hashOtp } = require('./hash-service');
const hashService = require('./hash-service')
const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken, {
    lazyLoading: true
})

class OtpService {
    async generateOtp() {
        // generate random otp using crypto in node
        const otp = crypto.randomInt(1000, 9999);
        return otp;
    }

    async sendBySms(phone, otp) {
        // Using twilio to send otp to phone number
        return await twilio.messages.create({
            to: phone,
            from: process.env.SMS_FROM_NUMBER,
            body: `Your OTP for talkNtoast is : ${otp}`
        })
    }

    verifyOtp(hashedOtp, data) {
        let computedHash = hashService.hashOtp(data)

        return computedHash === hashedOtp
    }
}

module.exports = new OtpService;