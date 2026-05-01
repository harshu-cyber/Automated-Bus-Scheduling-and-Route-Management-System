const Route = require('../models/Route');

exports.getAllRoutes = async (req, res) => {
    try {
        const filter = {};
        if (req.query.depot) filter.depot = req.query.depot;
        if (req.query.depotId) filter.depotId = req.query.depotId;
        const routes = await Route.find(filter).sort({ routeId: 1 });
        res.json(routes);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getRouteById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.json(route);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const data = { ...req.body };

        // Auto-generate routeId: find the highest existing RT-XXX and increment
        const lastRoute = await Route.findOne({}).sort({ routeId: -1 }).lean();
        let nextNum = 1;
        if (lastRoute && lastRoute.routeId) {
            const match = lastRoute.routeId.match(/RT-(\d+)/);
            if (match) nextNum = parseInt(match[1]) + 1;
        }
        data.routeId = `RT-${String(nextNum).padStart(3, '0')}`;

        // Derive fields from stopNames if provided
        if (data.stopNames && Array.isArray(data.stopNames) && data.stopNames.length >= 2) {
            data.startPoint = data.stopNames[0];
            data.endPoint = data.stopNames[data.stopNames.length - 1];
            data.stops = data.stopNames.length;
            // Auto-calculate distance: ~1.5 km avg between consecutive stops
            if (!data.distance || data.distance <= 0) {
                data.distance = parseFloat(((data.stopNames.length - 1) * 1.5).toFixed(1));
            }
        }

        const route = await Route.create(data);
        res.status(201).json(route);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.json(route);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });
        res.json({ message: 'Route deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
