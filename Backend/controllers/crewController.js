const Crew = require('../models/Crew');

exports.getAllCrew = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.status) filter.status = req.query.status;
        if (req.query.depot) filter.depot = req.query.depot;
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
        const { role, phone, name } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required to generate credentials' });
        }

        const isManager = role === 'Depot Manager';
        const prefix = isManager ? 'DM-' : 'CR-';

        const lastCrew = await Crew.findOne({ crewId: new RegExp(`^${prefix}`, 'i') }).sort({ crewId: -1 }).lean();
        let nextNum = 1;
        if (lastCrew && lastCrew.crewId) {
            const match = lastCrew.crewId.match(new RegExp(`^${prefix}(\\d+)`, 'i'));
            if (match) nextNum = parseInt(match[1], 10) + 1;
        }
        req.body.crewId = `${prefix}${String(nextNum).padStart(3, '0')}`;

        const member = await Crew.create(req.body);

        let userRole = 'driver';
        if (role === 'Depot Manager') userRole = 'depot';
        else if (role === 'Conductor') userRole = 'conductor';

        const User = require('../models/User');
        const Depot = require('../models/Depot');
        let dId = null;
        if (req.body.depot) {
            const d = await Depot.findOne({ name: req.body.depot });
            if (d) dId = d._id;
        }

        await User.create({
            username: req.body.crewId.toLowerCase(),
            password: phone,
            role: userRole,
            fullName: name,
            phone: phone,
            depot: req.body.depot || '',
            depotId: dId
        });

        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.updateCrew = async (req, res) => {
    try {
        if (req.body.depot) {
            const d = await require('../models/Depot').findOne({ name: req.body.depot });
            if (d) req.body.depotId = d._id;
        }
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
