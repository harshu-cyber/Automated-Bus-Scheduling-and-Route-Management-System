const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Crew = require('../models/Crew');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalBuses = await Bus.countDocuments();
        const activeRoutes = await Route.countDocuments({ status: 'Active' });
        const crewMembers = await Crew.countDocuments();
        
        // Mocking some stats for consistency with the UI
        const dailyPassengers = 12450;
        
        const busStatus = {
            active: await Bus.countDocuments({ status: 'Active' }),
            maintenance: await Bus.countDocuments({ status: 'Under Maintenance' }),
            retired: await Bus.countDocuments({ status: 'Retired' }),
            breakdown: await Bus.countDocuments({ status: 'Breakdown' })
        };

        res.json({
            totalBuses,
            activeRoutes,
            crewMembers,
            dailyPassengers,
            busStatus
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
