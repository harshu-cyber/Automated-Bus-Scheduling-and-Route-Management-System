const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    driverId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverName:  { type: String, required: true },
    leaveType:   { type: String, enum: ['Full Day', 'Half Day'], required: true },
    fromDate:    { type: Date, required: true },
    toDate:      { type: Date, required: true },
    totalDays:   { type: Number, required: true },
    reason:      { type: String, default: '' },
    status:      { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    reviewedBy:  { type: String, default: '' },
    reviewedAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
