const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    techStack: [{
        type: String
    }],
    pinned: {
        type: Boolean,
        default: false
    },
    emailAlerts: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
