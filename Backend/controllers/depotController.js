const Depot = require('../models/Depot');

exports.getAllDepots = async (req, res) => {
    try {
        const depots = await Depot.find({});
        res.json(depots);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getDepotById = async (req, res) => {
    try {
        const depot = await Depot.findById(req.params.id);
        if (!depot) return res.status(404).json({ message: 'Depot not found' });
        res.json(depot);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createDepot = async (req, res) => {
    try {
        const depot = await Depot.create(req.body);
        res.status(201).json(depot);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.updateDepot = async (req, res) => {
    try {
        const depot = await Depot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!depot) return res.status(404).json({ message: 'Depot not found' });
        res.json(depot);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.deleteDepot = async (req, res) => {
    try {
        const depot = await Depot.findByIdAndDelete(req.params.id);
        if (!depot) return res.status(404).json({ message: 'Depot not found' });
        res.json({ message: 'Depot deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
