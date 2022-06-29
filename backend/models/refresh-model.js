const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshSchema = new Schema({
    token: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User'} // reference from User model
}, {
    timestamps: true
})

module.exports = mongoose.model('Refresh', refreshSchema, 'tokens') // (model name, schema, collection name)