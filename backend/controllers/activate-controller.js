const Jimp = require('jimp')
const path = require('path')
const userService = require('../services/user-service')
const UserDto = require('../dtos/user-dto')
class ActivateController {
    async activate(req, res) {
        const { name, avatar } = req.body
        if (!name || !avatar) {
            res.status(400).json({ message: 'All fields are required' })
        }

        // Convert the base64 Image string to an image and store in file system (storage folder)
        const buffer = Buffer.from(avatar.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64') // we only need the base64 string, so replace 'data:image/png;base64' with '' which is prefixed to it

        const imageName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}.png`

        // Compress the image
        try {
            const jimpResponse = await Jimp.read(buffer)
            jimpResponse.resize(150, Jimp.AUTO).write(path.resolve(__dirname, `../storage/${imageName}`)) // (width, height)
        } catch (err) {
            res.status(500).json({ message: "Couldn't process the image :(" })
        }


        // Activate / Update User
        const userId = req.user._id

        try {
            const user = await userService.findUser({ _id: userId })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
            }
            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imageName}`
            user.save()

            res.json({ user: new UserDto(user), auth: true })
        } catch (err) {
            res.status(500).json({ message: 'Something went wrong!' })
        }
    }
}

module.exports = new ActivateController();