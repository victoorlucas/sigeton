const mongoose = require('mongoose');

const hackatonSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    local: {type: String, required: true},
    description: {type: String, required: true},
    teams: {type: Array, required: true},
    teamsQuantity: {type: Number, required: true}
});

module.exports = mongoose.model('Hackaton', hackatonSchema);