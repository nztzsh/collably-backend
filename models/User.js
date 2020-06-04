const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    myProjects: {type: [ObjectId]},
    totRatings: {type: Number, default: 0},
    rating: {type: Number},
    raters: {type: [String]},
    password: {type: String, required: true},
    displayName: {type: String, required: true},
    bio: {type: String} 
});

module.exports = mongoose.models['User'] || mongoose.model('User', UserSchema);