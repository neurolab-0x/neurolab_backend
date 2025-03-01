const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    condition: {
        type: String,
        required: true,
    },
    role : {
        type : String,
        enum : ['doctor', 'patient'],
        default : "patient"
    },
    brainActivityData: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('users', patientSchema);
