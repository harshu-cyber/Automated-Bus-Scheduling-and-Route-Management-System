const Bus = require('../models/Bus');

exports.getAllBuses = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.depot) filter.depot = req.query.depot;
        const buses = await Bus.find(filter).sort({ regNo: 1 });
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getBusById = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.id);
        if (!bus) return res.status(404).json({ message: 'Bus not found' });
        res.json(bus);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createBus = async (req, res) => {
    try {
        if (req.body.depot) {
            const d = await require('../models/Depot').findOne({ name: req.body.depot });
            if (d) req.body.depotId = d._id;
        }
        const bus = await Bus.create(req.body);
        res.status(201).json(bus);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.updateBus = async (req, res) => {
    try {
        if (req.body.depot) {
            const d = await require('../models/Depot').findOne({ name: req.body.depot });
            if (d) req.body.depotId = d._id;
        }
        const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!bus) return res.status(404).json({ message: 'Bus not found' });
        res.json(bus);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);
        if (!bus) return res.status(404).json({ message: 'Bus not found' });
        res.json({ message: 'Bus deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
