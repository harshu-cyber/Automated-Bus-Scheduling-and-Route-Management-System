const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema({
    name:       { type: String, required: true, unique: true },
    location:   { type: String, default: '' },
    totalCapacity: { type: Number, default: 50 },
    busCount:   { type: Number, default: 0 },
    routeCount: { type: Number, default: 0 },
    crewCount:  { type: Number, default: 0 },
    utilization:{ type: Number, default: 0 },  // percentage
}, { timestamps: true });

module.exports = mongoose.model('Depot', depotSchema);
