const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password: {type: String, required: true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    shirtSize: {type: String, required: true},
    typeOfMember: {type: Boolean, default: false},
    photoURL: {type: String, default: 'uploads/default.png'}
});

module.exports = mongoose.model('Member', memberSchema);