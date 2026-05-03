const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');

// Import all models
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Crew = require('../models/Crew');
const Schedule = require('../models/Schedule');
const Depot = require('../models/Depot');
const Leave = require('../models/Leave');
const User = require('../models/User');

const clearData = async () => {
    try {
        await connectDB();
        
        console.log('🚮 Clearing all collections...');
        
        await Bus.deleteMany({});
        await Route.deleteMany({});
        await Crew.deleteMany({});
        await Schedule.deleteMany({});
        await Depot.deleteMany({});
        await Leave.deleteMany({});
        // Optional: Keep users? User requested to delete all data, but maybe they want to keep admin?
        // I'll delete everything but keep the logic simple.
        await User.deleteMany({}); 

        console.log('✅ All data cleared successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error clearing data:', err.message);
        process.exit(1);
    }
};

clearData();
