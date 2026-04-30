const mongoose = require('mongoose');

const crewSchema = new mongoose.Schema({
    crewId:    { type: String, required: true, unique: true },
    name:      { type: String, required: true },
    role:      { type: String, enum: ['Driver', 'Conductor', 'Depot Manager'], required: true },
    licenseNo: { type: String, default: '—' },
    phone:     { type: String, default: '' },
    assignedBus: { type: String, default: '—' },    // bus regNo
    depot:     { type: String, default: '—' },
    depotId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', default: null },
    status:    { type: String, enum: ['On Duty', 'Off Duty', 'On Leave'], default: 'Off Duty' },
}, { timestamps: true });

module.exports = mongoose.model('Crew', crewSchema);
