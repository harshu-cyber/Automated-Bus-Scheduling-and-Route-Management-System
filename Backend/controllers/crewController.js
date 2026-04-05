const Crew = require('../models/Crew');

exports.getAllCrew = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.status) filter.status = req.query.status;
        const crew = await Crew.find(filter).sort({ crewId: 1 });
        res.json(crew);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getCrewById = async (req, res) => {
    try {
        const member = await Crew.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Crew member not found' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createCrew = async (req, res) => {
    try {
        const member = await Crew.create(req.body);
        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.updateCrew = async (req, res) => {
    try {
        const member = await Crew.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!member) return res.status(404).json({ message: 'Crew member not found' });
        res.json(member);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.deleteCrew = async (req, res) => {
    try {
        const member = await Crew.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).json({ message: 'Crew member not found' });
        res.json({ message: 'Crew member deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
