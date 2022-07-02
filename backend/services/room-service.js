const RoomModel = require('../models/room-model')

class RoomService {
    async create(payload) {
        const { topic, roomType, ownerId } = payload;
        const room = await RoomModel.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId]
        }
        )
        return room;
    }

    async getAllRooms(types) {
        const rooms = await RoomModel.find({ roomType: { $in: types } }) // types is an array, so filter for each type in array
            .populate('speakers') // will get all details from the referred mongodb collection
            .populate('ownerId')
            .exec()  
        return rooms;
    }
}

module.exports = new RoomService();