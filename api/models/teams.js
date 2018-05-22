const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    members: {type: Array, required: true},
    inscDate: {type: Date, required: true}
    //{ type: Tyoes.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Team', teamSchema);