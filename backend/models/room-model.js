const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    topic: { type: String, required: true },
    roomType: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' }, // reference from User model
    speakers: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Room', roomSchema, 'rooms') // (model name, schema, collection name)