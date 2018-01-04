const mongoose = require('mongoose');
const GroupSchema = mongoose.Schema({
    name: {type: String, default: ''},
    image: {type: String, default: 'default.png'},
    members: [{
        username: {type: String, default: ''},
        admin: {type: Boolean, default: false},
    }],
});

module.exports = mongoose.model('group', GroupSchema);