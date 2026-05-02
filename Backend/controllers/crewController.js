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
        console.log('[Crew] Incoming Create Request:', req.body);
        const { role, phone, name, crewId } = req.body;
        
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required to generate credentials' });
        }

        const isManager = role === 'Depot Manager';
        const prefix = isManager ? 'DM-' : 'CR-';

        // Use provided crewId or auto-generate
        let finalCrewId = crewId;
        if (!finalCrewId) {
            const lastCrew = await Crew.findOne({ crewId: new RegExp(`^${prefix}`, 'i') }).sort({ crewId: -1 }).lean();
            let nextNum = 1;
            if (lastCrew && lastCrew.crewId) {
                const match = lastCrew.crewId.match(new RegExp(`^${prefix}(\\d+)`, 'i'));
                if (match) nextNum = parseInt(match[1], 10) + 1;
            }
            finalCrewId = `${prefix}${String(nextNum).padStart(3, '0')}`;
        }
        req.body.crewId = finalCrewId;

        // Check if User already exists with this ID
        const User = require('../models/User');
        const existingUser = await User.findOne({ username: finalCrewId.toLowerCase() });
        if (existingUser) {
            console.error(`[Crew] User already exists with ID: ${finalCrewId}`);
            return res.status(400).json({ message: `A login account with ID ${finalCrewId} already exists. Please choose a different ID or delete the old account.` });
        }

        // ═══════════════════════════════════════════════
        // DEPOT LOOKUP ENHANCEMENT
        // ═══════════════════════════════════════════════
        const Depot = require('../models/Depot');
        let dId = null;
        let finalDepotName = req.body.depot || '';

        if (finalDepotName) {
            // Case-insensitive exact match
            const d = await Depot.findOne({ name: { $regex: new RegExp(`^${finalDepotName.trim()}$`, 'i') } });
            if (d) {
                dId = d._id;
                finalDepotName = d.name; // Use canonical name
            }
        }
        
        req.body.depotId = dId;
        req.body.depot = finalDepotName;

        const member = await Crew.create(req.body);

        let userRole = 'driver';
        const normalizedRole = (role || '').toLowerCase();
        if (normalizedRole.includes('manager')) userRole = 'depot';
        else if (normalizedRole.includes('conductor')) userRole = 'conductor';

        await User.create({
            username: finalCrewId.toLowerCase(),
            password: phone,
            role: userRole,
            fullName: name,
            phone: phone,
            depot: finalDepotName,
            depotId: dId
        });

        console.log(`✅ [Crew] Created member ${finalCrewId} (${name}) and linked User account (Role: ${userRole})`);

        res.status(201).json({
            member,
            credentials: {
                username: finalCrewId,
                password: phone
            }
        });
    } catch (err) {
        console.error('❌ [Crew] Create Error:', err.message);
        res.status(400).json({ 
            message: err.message.includes('duplicate key') ? 'Duplicate ID or Phone number' : 'Failed to create crew member', 
            error: err.message 
        });
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
