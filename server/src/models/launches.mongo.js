const mongoose = require("mongoose");

const launchesSchema = new mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true,
    },
    mission: {
        type: String,
        required: true,
    },
    target: {
        type: String,
    },
    upcoming: {
        type: Boolean,
        required: true,
    },
    customers: [String],
    success: {
        type: Boolean,
        required: true,
        defalut: true,
    },
});

module.exports = mongoose.model("Launch", launchesSchema);
