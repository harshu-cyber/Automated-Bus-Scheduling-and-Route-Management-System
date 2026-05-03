const Depot = require('../models/Depot');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Crew = require('../models/Crew');

exports.getAllDepots = async (req, res) => {
    try {
        let depots = await Depot.find({});
        
        // Enhance with dynamic counts
        const enhancedDepots = await Promise.all(depots.map(async (depot) => {
            const busCount = await Bus.countDocuments({ depot: depot.name });
            const routeCount = await Route.countDocuments({ depot: depot.name });
            const crewCount = await Crew.countDocuments({ depot: depot.name });
            
            // Calculate utilization
            const cap = depot.totalCapacity || 50;
            const util = Math.round((busCount / cap) * 100);
            
            return {
                ...depot.toObject(),
                busCount,
                routeCount,
                crewCount,
                utilization: util
            };
        }));

        res.json(enhancedDepots);
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
