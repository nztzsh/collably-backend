const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

const ProjectSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    createdBy: {type: ObjectId, required: true},
    universities: {type: [String]},
    minQual: {type: String},
    countries: {type: [String]},
    minAge: {type: Number},
    maxAge: {type: Number},
    skills: {type: [String]},
    members: {type: [{id: ObjectId, status: String, priority: Number}]}
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;