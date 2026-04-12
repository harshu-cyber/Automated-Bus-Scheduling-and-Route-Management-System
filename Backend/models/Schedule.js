const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    date:    { type: String, required: true },      // Date in YYYY-MM-DD format (e.g., "2026-04-12")
    day:     { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
    time:    { type: String, required: true },
    route:   { type: String, required: true },     // routeId reference
    routeName: { type: String, default: '' },
    bus:     { type: String, default: '' },          // bus regNo
    driver:  { type: String, default: '' },          // driver name
    status:  { type: String, enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'], default: 'Scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
