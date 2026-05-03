const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await connectDB();
        
        const adminEmail = 'admin@dtcsl.com';
        const adminPass = 'admin123';
        
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            console.log('⚠️ Admin already exists!');
            process.exit(0);
        }

        await User.create({
            username: 'admin',
            fullName: 'System Admin',
            email: adminEmail,
            password: adminPass, // The pre-save hook will hash this
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: ' + adminEmail);
        console.log('🔑 Password: ' + adminPass);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

createAdmin();
