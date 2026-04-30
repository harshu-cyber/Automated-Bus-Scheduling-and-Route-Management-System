const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    routeId:   { type: String, required: true, unique: true },
    name:      { type: String, required: true },
    startPoint:{ type: String, default: '' },
    endPoint:  { type: String, default: '' },
    stops:     { type: Number, default: 0 },
    stopNames: [{ type: String }],              // ordered list of stop names
    distance:  { type: Number, default: 0 },    // in km
    depot:     { type: String, default: '' },
    depotId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', default: null },
    status:    { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' },
    coordinates: [{ lat: Number, lng: Number }],
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
