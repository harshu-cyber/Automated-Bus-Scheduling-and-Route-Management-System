const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    regNo:       { type: String, required: true, unique: true },
    type:        { type: String, enum: ['AC', 'Non-AC', 'Electric'], default: 'AC' },
    capacity:    { type: Number, default: 50 },
    depot:       { type: String, default: '' },
    status:      { type: String, enum: ['Active', 'Under Maintenance', 'Retired', 'Breakdown'], default: 'Active' },
    lastService: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
