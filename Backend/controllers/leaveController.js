const Leave = require('../models/Leave');

// Create a leave request (Driver)
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, totalDays, reason } = req.body;

        if (!leaveType || !fromDate || !toDate || !totalDays) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const leave = await Leave.create({
            driverId: req.user.id,
            driverName: req.user.username,
            leaveType,
            fromDate,
            toDate,
            totalDays,
            reason: reason || '',
        });

        res.status(201).json({ message: 'Leave applied successfully', leave });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get leaves for the logged-in driver
exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ driverId: req.user.id }).sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all leave requests (Depot Manager / Admin)
exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Approve or Reject a leave (Depot Manager / Admin)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be Approved or Rejected' });
        }

        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            { status, reviewedBy: req.user.username, reviewedAt: new Date() },
            { new: true }
        );

        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        res.json({ message: `Leave ${status.toLowerCase()}`, leave });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a leave request
exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        res.json({ message: 'Leave deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
