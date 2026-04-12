const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const Crew = require('../models/Crew');
const User = require('../models/User');

// ═══════════════════════════════════════════════════
//  GET: Fetch all schedule entries
// ═══════════════════════════════════════════════════
exports.getAllSchedules = async (req, res) => {
    try {
        const filter = {};
        if (req.query.day) filter.day = req.query.day; // query params
        const entries = await Schedule.find(filter).sort({ day: 1, time: 1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ═══════════════════════════════════════════════════
//  POST: Create a single schedule entry
// ═══════════════════════════════════════════════════
exports.createScheduleEntry = async (req, res) => {
    try {
        const entry = await Schedule.create(req.body);
        res.status(201).json(entry);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

// ═══════════════════════════════════════════════════
//  PUT: Update a schedule entry
// ═══════════════════════════════════════════════════
exports.updateScheduleEntry = async (req, res) => {
    try {
        const entry = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!entry) return res.status(404).json({ message: 'Schedule entry not found' });
        res.json(entry);
    } catch (err) {
        res.status(400).json({ message: 'Invalid data', error: err.message });
    }
};

// ═══════════════════════════════════════════════════
//  DELETE: Delete a schedule entry
// ═══════════════════════════════════════════════════
exports.deleteScheduleEntry = async (req, res) => {
    try {
        const entry = await Schedule.findByIdAndDelete(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Schedule entry not found' });
        res.json({ message: 'Schedule entry deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ═══════════════════════════════════════════════════
//  AUTO-GENERATE: Smart Bus Scheduling Logic
//  Fetches only registered resources from database
//  Enforces: no double-booking, no hardcoding, no dummy data
// ═══════════════════════════════════════════════════
exports.autoGenerateSchedule = async (req, res) => {
    try {
        // Fetch ONLY registered (active) resources from database
        const activeRoutes = await Route.find({ status: 'Active' }).lean();
        const activeBuses  = await Bus.find({ status: 'Active' }).lean();
        
        // Fixed: Crew model only has 'On Duty', 'Off Duty', 'On Leave' statuses
        // Removed invalid 'Available' status
        const availableDrivers = await Crew.find({ 
            role: 'Driver', 
            status: 'On Duty'  // Only drivers currently on duty
        }).lean();

        // Validation: Ensure minimum required resources exist
        if (!activeRoutes.length) {
            return res.status(400).json({ 
                message: 'No active routes available for scheduling.',
                code: 'MISSING_ROUTES'
            });
        }
        if (!activeBuses.length) {
            return res.status(400).json({ 
                message: 'No active buses available for scheduling.',
                code: 'MISSING_BUSES'
            });
        }
        if (!availableDrivers.length) {
            return res.status(400).json({ 
                message: 'No available drivers for scheduling.',
                code: 'MISSING_DRIVERS'
            });
        }

        // Get current date and time for daily schedule generation
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();

        // Define all possible time slots (24-hour format)
        const allTimeSlots = [
        '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00',
        '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00',
        '17:00', '18:00', '19:00',
        '20:00', '21:00', '22:00'
        ];
        
        // Get day name for today (e.g., "Monday")
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[now.getDay()];

        // Filter time slots: only include slots from current time until 23:59
        const relevantTimeSlots = allTimeSlots.filter(slot => {
            const [slotHour, slotMinutes] = slot.split(':').map(Number);
            const slotTotalMinutes = slotHour * 60 + slotMinutes;
            const currentTotalMinutes = currentHour * 60 + currentMinutes;
            return slotTotalMinutes >= currentTotalMinutes;
        });

        // Add 23:00 slot if not already present (to ensure coverage until end of day)
        if (!relevantTimeSlots.includes('23:00') && currentHour < 23) {
            relevantTimeSlots.push('23:00');
        }

        // Validation: Ensure there are available time slots for today
        if (relevantTimeSlots.length === 0) {
            return res.status(400).json({ 
                message: 'No available time slots remaining for today. Schedule generation only available before 11:59 PM.',
                code: 'NO_TIME_SLOTS'
            });
        }

        const generatedEntries = [];
        
        // Track resource utilization per time slot to avoid double-booking
        const resourceState = {}; // { [time]: { buses: Set, drivers: Set } }

        // Track driver work count for today
        const driverDailyWork = {}; // { [driverName]: count }

        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
        const shuffledRoutes = shuffle(activeRoutes);
        
        // Generate schedule only for today with relevant time slots
        let slotIndex = 0;
        for (const time of relevantTimeSlots) {
            const slotKey = `${time}`;
            resourceState[slotKey] = { 
                buses: new Set(), 
                drivers: new Set() 
            };

            // Rotate routes for this slot — each slot starts from a different route
            const routeOffset = slotIndex % shuffledRoutes.length;

            // How many trips this slot (limited by resources, max 4 concurrent)
            const maxTrips = Math.min(
                shuffledRoutes.length, 
                activeBuses.length, 
                availableDrivers.length, 
                4
            );

            // Pick only a subset of routes per slot (rotate which ones)
            // e.g. with 5 routes and maxTrips=3: slot0→[0,1,2], slot1→[1,2,3], slot2→[2,3,4]
            const tripsThisSlot = Math.min(maxTrips, Math.max(1, Math.ceil(shuffledRoutes.length / 2)));

            for (let i = 0; i < tripsThisSlot; i++) {
                const routeIdx = (routeOffset + i) % shuffledRoutes.length;
                const route = shuffledRoutes[routeIdx];
                
                // Rotate bus selection — offset by slot index
                const busOffset = (slotIndex + i) % activeBuses.length;
                let bus = null;
                for (let b = 0; b < activeBuses.length; b++) {
                    const candidate = activeBuses[(busOffset + b) % activeBuses.length];
                    if (!resourceState[slotKey].buses.has(candidate.regNo)) {
                        bus = candidate;
                        break;
                    }
                }
                
                // Rotate driver selection — offset by slot index
                const driverOffset = (slotIndex + i) % availableDrivers.length;
                let driver = null;
                for (let d = 0; d < availableDrivers.length; d++) {
                    const candidate = availableDrivers[(driverOffset + d) % availableDrivers.length];
                    const dailyCount = driverDailyWork[candidate.name] || 0;
                    if (!resourceState[slotKey].drivers.has(candidate.name) && dailyCount < 3) {
                        driver = candidate;
                        break;
                    }
                }

                if (bus && driver) {
                    resourceState[slotKey].buses.add(bus.regNo);
                    resourceState[slotKey].drivers.add(driver.name);
                    driverDailyWork[driver.name] = (driverDailyWork[driver.name] || 0) + 1;

                    generatedEntries.push({
                        date: currentDate,
                        day: dayName,
                        time,
                        route: route.routeId,
                        routeName: route.name,
                        bus: bus.regNo,
                        driver: driver.name,
                        status: 'Scheduled'
                    });
                }
            }
            slotIndex++;
        }

        // Validation: Ensure schedule was generated
        if (!generatedEntries.length) {
            return res.status(400).json({ 
                message: 'Unable to generate schedule. Insufficient resources.',
                code: 'GENERATION_FAILED'
            });
        }

        // IMPORTANT: Delete existing unperformed schedules
        // Only delete non-active schedules to preserve completed ones
        await Schedule.deleteMany({ status: { $ne: 'Completed' } });
        
        // Save generated schedule to database
        const saved = await Schedule.insertMany(generatedEntries);

        res.status(201).json({
            message: 'Daily schedule auto-generated successfully from registered resources.',
            count: saved.length,
            data: saved,
            summary: { 
                date: currentDate,
                dayName: dayName,
                timeSlots: relevantTimeSlots.length,
                totalTrips: saved.length,
                busesUsed: new Set(saved.map(s => s.bus)).size,
                driversUsed: new Set(saved.map(s => s.driver)).size,
                routesUsed: new Set(saved.map(s => s.route)).size
            }
        });

    } catch (err) {
        res.status(500).json({ 
            message: 'Auto-generate schedule failed',
            error: err.message,
            code: 'SCHEDULE_GENERATION_ERROR'
        });
    }
};

// ═══════════════════════════════════════════════════
//  APPLY SCHEDULE: Save Generated Schedule to DB
//  Accepts array of schedule entries from frontend
//  NO regeneration, NO reshuffling
//  Validates resources exist, prevents duplicates
// ═══════════════════════════════════════════════════
exports.applySchedule = async (req, res) => {
    try {
        const { scheduleEntries } = req.body;

        // Validation: Ensure request contains schedule data
        if (!scheduleEntries || !Array.isArray(scheduleEntries)) {
            return res.status(400).json({
                message: 'Invalid request. Expected "scheduleEntries" array.',
                code: 'INVALID_REQUEST'
            });
        }

        if (scheduleEntries.length === 0) {
            return res.status(400).json({
                message: 'Schedule entries array cannot be empty.',
                code: 'EMPTY_SCHEDULE'
            });
        }

        // Validation: Max 500 entries per apply (prevent abuse)
        if (scheduleEntries.length > 500) {
            return res.status(400).json({
                message: 'Too many schedule entries. Maximum 500 allowed.',
                code: 'SCHEDULE_TOO_LARGE'
            });
        }

        // ═══════════════════════════════════════════════
        // STEP 1: Extract and validate all entries format
        // ═══════════════════════════════════════════════
        const validatedEntries = [];
        const formatErrors = [];

        for (let idx = 0; idx < scheduleEntries.length; idx++) {
            const entry = scheduleEntries[idx];
            const entryNum = idx + 1;

            // Validate required fields exist
            if (!entry.day || !entry.time || !entry.bus || !entry.driver || !entry.route) {
                formatErrors.push({
                    index: entryNum,
                    entry,
                    reason: 'Missing required fields (day, time, bus, driver, route)'
                });
                continue;
            }

            // Validate day
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            if (!validDays.includes(entry.day)) {
                formatErrors.push({
                    index: entryNum,
                    entry,
                    reason: `Invalid day: ${entry.day}`
                });
                continue;
            }

            // Validate time format (HH:MM)
            if (!/^\d{2}:\d{2}$/.test(entry.time)) {
                formatErrors.push({
                    index: entryNum,
                    entry,
                    reason: `Invalid time format: ${entry.time}. Expected HH:MM`
                });
                continue;
            }

            validatedEntries.push(entry);
        }

        // If all entries have format errors, stop here
        if (validatedEntries.length === 0) {
            return res.status(400).json({
                message: 'No valid schedule entries could be processed due to format errors.',
                code: 'FORMAT_VALIDATION_FAILED',
                errors: formatErrors,
                processedCount: 0
            });
        }

        // ═══════════════════════════════════════════════
        // STEP 2: Conflict detection (internal scheduling conflicts)
        // ═══════════════════════════════════════════════
        const conflicts = [];
        const busScheduleByDay = {};
        const driverScheduleByDay = {};
        const routesByDayTime = {};

        for (let idx = 0; idx < validatedEntries.length; idx++) {
            const entry = validatedEntries[idx];
            const entryNum = idx + 1;
            const dayTimeKey = `${entry.day}_${entry.time}`;
            const dayKey = entry.day;

            if (!busScheduleByDay[dayKey]) busScheduleByDay[dayKey] = [];
            if (!driverScheduleByDay[dayKey]) driverScheduleByDay[dayKey] = [];
            if (!routesByDayTime[dayTimeKey]) routesByDayTime[dayTimeKey] = [];

            // Check bus overlap
            for (const scheduled of busScheduleByDay[dayKey]) {
                if (scheduled.bus === entry.bus && timeSlotsOverlap(scheduled.time, entry.time)) {
                    conflicts.push({
                        index: entryNum,
                        type: 'BUS_OVERLAP',
                        severity: 'CRITICAL',
                        message: `Bus "${entry.bus}" already assigned at ${scheduled.time} on ${dayKey}`
                    });
                    break;
                }
            }

            // Check driver overlap
            for (const scheduled of driverScheduleByDay[dayKey]) {
                if (scheduled.driver === entry.driver && timeSlotsOverlap(scheduled.time, entry.time)) {
                    conflicts.push({
                        index: entryNum,
                        type: 'DRIVER_OVERLAP',
                        severity: 'CRITICAL',
                        message: `Driver "${entry.driver}" already assigned at ${scheduled.time} on ${dayKey}`
                    });
                    break;
                }
            }

            // Check duplicate route in slot
            if (routesByDayTime[dayTimeKey].includes(entry.route)) {
                conflicts.push({
                    index: entryNum,
                    type: 'DUPLICATE_ROUTE',
                    severity: 'MAJOR',
                    message: `Route "${entry.route}" already assigned for ${dayKey} at ${entry.time}`
                });
            }

            // No conflicts so far, track this entry
            if (!conflicts.some(c => c.index === entryNum)) {
                busScheduleByDay[dayKey].push({ time: entry.time, bus: entry.bus });
                driverScheduleByDay[dayKey].push({ time: entry.time, driver: entry.driver });
                routesByDayTime[dayTimeKey].push(entry.route);
            }
        }

        // If conflicts detected, return error
        if (conflicts.length > 0) {
            return res.status(400).json({
                message: `Schedule conflict validation failed. ${conflicts.length} conflict(s) detected.`,
                code: 'SCHEDULE_CONFLICTS',
                conflicts,
                processedCount: validatedEntries.length
            });
        }

        // ═══════════════════════════════════════════════
        // STEP 3: Database validation (resource existence)
        // ═══════════════════════════════════════════════
        const activeBuses = await Bus.find({ status: 'Active' }).select('regNo').lean();
        const availableDrivers = await Crew.find({ role: 'Driver', status: 'On Duty' }).select('name').lean();
        const activeRoutes = await Route.find({ status: 'Active' }).select('routeId name').lean();

        const busMap = new Set(activeBuses.map(b => b.regNo));
        const driverMap = new Set(availableDrivers.map(d => d.name));
        const routeMap = new Set(activeRoutes.map(r => r.routeId));

        const resourceErrors = [];

        for (let idx = 0; idx < validatedEntries.length; idx++) {
            const entry = validatedEntries[idx];
            const entryNum = idx + 1;

            if (!busMap.has(entry.bus)) {
                resourceErrors.push({
                    index: entryNum,
                    type: 'INVALID_BUS',
                    reason: `Bus "${entry.bus}" not found or not active`
                });
            }
            if (!driverMap.has(entry.driver)) {
                resourceErrors.push({
                    index: entryNum,
                    type: 'INVALID_DRIVER',
                    reason: `Driver "${entry.driver}" not found or not on duty`
                });
            }
            if (!routeMap.has(entry.route)) {
                resourceErrors.push({
                    index: entryNum,
                    type: 'INVALID_ROUTE',
                    reason: `Route "${entry.route}" not found or not active`
                });
            }
        }

        if (resourceErrors.length > 0) {
            return res.status(400).json({
                message: 'Schedule validation failed due to invalid resources.',
                code: 'RESOURCE_VALIDATION_FAILED',
                errors: resourceErrors,
                processedCount: validatedEntries.length
            });
        }

        // ═══════════════════════════════════════════════
        // STEP 4: Check database for duplicates (already saved)
        // ═══════════════════════════════════════════════
        const duplicateErrors = [];

        for (const entry of validatedEntries) {
            const existingEntry = await Schedule.findOne({
                day: entry.day,
                time: entry.time,
                bus: entry.bus,
                driver: entry.driver,
                route: entry.route,
                status: { $ne: 'Cancelled' }
            }).lean();

            if (existingEntry) {
                duplicateErrors.push({
                    entry,
                    reason: `This exact assignment is already saved in database`
                });
            }
        }

        if (duplicateErrors.length > 0) {
            return res.status(400).json({
                message: 'Cannot apply schedule. Entries already exist in database.',
                code: 'DUPLICATE_ENTRIES',
                errors: duplicateErrors,
                recommendation: 'Review existing schedule or proceed with force update'
            });
        }

        // ═══════════════════════════════════════════════
        // STEP 5: Save all entries to MongoDB
        // ═══════════════════════════════════════════════
        const scheduleDocsToSave = validatedEntries.map(entry => ({
            day: entry.day,
            time: entry.time,
            route: entry.route,
            routeName: entry.routeName || '',
            bus: entry.bus,
            driver: entry.driver,
            status: 'Scheduled'
        }));

        const saved = await Schedule.insertMany(scheduleDocsToSave);

        res.status(201).json({
            message: `Schedule applied successfully. ${saved.length} entries saved.`,
            code: 'SCHEDULE_APPLIED',
            processedCount: validatedEntries.length,
            savedCount: saved.length,
            data: saved
        });

    } catch (err) {
        res.status(500).json({
            message: 'Failed to apply schedule',
            code: 'APPLY_SCHEDULE_ERROR',
            error: err.message
        });
    }
};

// ═══════════════════════════════════════════════════
//  HELPER: Validate schedule conflicts
// ═══════════════════════════════════════════════════
// Helper function to parse time string to minutes
const timeToMinutes = (timeStr) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    return hours * 60 + mins;
};

// Helper function to check if two time slots overlap
// Assumes each slot is 2 hours long
const timeSlotsOverlap = (time1, time2, bufferMins = 120) => {
    const t1 = timeToMinutes(time1);
    const t2 = timeToMinutes(time2);
    const slotDuration = 120; // 2 hours per slot
    
    const start1 = t1;
    const end1 = t1 + slotDuration;
    const start2 = t2;
    const end2 = t2 + slotDuration;
    
    // Check for overlap
    return start1 < end2 && start2 < end1;
};

exports.validateScheduleConflicts = async (req, res) => {
    try {
        const { scheduleEntries } = req.body;

        if (!scheduleEntries || !Array.isArray(scheduleEntries) || scheduleEntries.length === 0) {
            return res.status(400).json({
                message: 'Invalid request. Expected non-empty "scheduleEntries" array.',
                code: 'INVALID_REQUEST'
            });
        }

        const conflicts = [];
        const warnings = [];

        // Track resources per day for conflict detection
        const busScheduleByDay = {}; // { [day]: [{ time, bus }, ...] }
        const driverScheduleByDay = {}; // { [day]: [{ time, driver }, ...] }
        const routesByDayTime = {}; // { [day_time]: [routes] }

        // Process each entry to detect conflicts
        for (let idx = 0; idx < scheduleEntries.length; idx++) {
            const entry = scheduleEntries[idx];
            const entryNum = idx + 1;
            const dayTimeKey = `${entry.day}_${entry.time}`;
            const dayKey = entry.day;

            // Initialize tracking structures
            if (!busScheduleByDay[dayKey]) busScheduleByDay[dayKey] = [];
            if (!driverScheduleByDay[dayKey]) driverScheduleByDay[dayKey] = [];
            if (!routesByDayTime[dayTimeKey]) routesByDayTime[dayTimeKey] = [];

            // Check for same bus in overlapping shifts on same day
            for (const scheduled of busScheduleByDay[dayKey]) {
                if (scheduled.bus === entry.bus && timeSlotsOverlap(scheduled.time, entry.time)) {
                    conflicts.push({
                        index: entryNum,
                        type: 'BUS_OVERLAP',
                        severity: 'CRITICAL',
                        message: `Bus "${entry.bus}" already assigned at ${scheduled.time} on ${dayKey} (overlapping shift detected)`,
                        conflictWith: scheduled
                    });
                }
            }

            // Check for same driver in overlapping shifts on same day
            for (const scheduled of driverScheduleByDay[dayKey]) {
                if (scheduled.driver === entry.driver && timeSlotsOverlap(scheduled.time, entry.time)) {
                    conflicts.push({
                        index: entryNum,
                        type: 'DRIVER_OVERLAP',
                        severity: 'CRITICAL',
                        message: `Driver "${entry.driver}" already assigned at ${scheduled.time} on ${dayKey} (overlapping shift detected)`,
                        conflictWith: scheduled
                    });
                }
            }

            // Check for duplicate route in same day+time slot
            if (routesByDayTime[dayTimeKey].includes(entry.route)) {
                conflicts.push({
                    index: entryNum,
                    type: 'DUPLICATE_ROUTE',
                    severity: 'MAJOR',
                    message: `Route "${entry.route}" already assigned for ${dayKey} at ${entry.time}`,
                    conflictWith: null
                });
            }

            // Track this entry for future checks
            busScheduleByDay[dayKey].push({ time: entry.time, bus: entry.bus });
            driverScheduleByDay[dayKey].push({ time: entry.time, driver: entry.driver });
            routesByDayTime[dayTimeKey].push(entry.route);
        }

        // Response format
        if (conflicts.length === 0) {
            return res.json({
                message: 'No schedule conflicts detected. Schedule is valid.',
                code: 'SCHEDULE_VALID',
                hasConflicts: false,
                conflictCount: 0,
                warningCount: warnings.length,
                conflicts: [],
                warnings: warnings.length > 0 ? warnings : undefined
            });
        }

        // Report conflicts found
        res.status(400).json({
            message: `Schedule validation failed. ${conflicts.length} conflict(s) detected.`,
            code: 'SCHEDULE_CONFLICTS',
            hasConflicts: true,
            conflictCount: conflicts.length,
            warningCount: warnings.length,
            conflicts,
            warnings: warnings.length > 0 ? warnings : undefined,
            recommendation: 'Review and fix conflicts before applying schedule.'
        });

    } catch (err) {
        res.status(500).json({
            message: 'Conflict validation failed',
            code: 'VALIDATION_ERROR',
            error: err.message
        });
    }
};

// ═══════════════════════════════════════════════════
//  GET: Driver-specific route view (my assigned route)
// ═══════════════════════════════════════════════════
//  GET /api/schedule/my-route
//  Driver-only view of assigned routes
//  JWT Auth Required | Role must be 'driver'
//
//  SECURITY PIPELINE (12-Step):
//  1. Extract username from JWT
//  2. Lookup User in database (404 if missing)
//  3. Check role == 'driver' (403 if wrong role)
//  4. Lookup Crew record by multiple strategies (404 if not found)
//  5. Verify Crew.role == 'Driver'
//  6. Query Schedule entries by Crew.name
//  7. Exit early if no schedules (200 with empty data)
//  8. Fetch Bus details by regNo
//  9. Fetch Route details by routeId
// 10. Validate all enrichments exist (fail if references broken)
// 11. Build frontend-friendly response
// 12. Return with proper timestamps and stats
// ═══════════════════════════════════════════════════
exports.getMyRoute = async (req, res) => {
    try {
        // ════════════════════════════════════════════════════════
        // STEP 1-2: Extract JWT username and verify User exists
        // ════════════════════════════════════════════════════════
        const username = req.user.username;
        if (!username) {
            return res.status(401).json({
                message: 'Invalid token. Username not found in JWT.',
                code: 'INVALID_JWT'
            });
        }

        const user = await User.findOne({ username: username })
            .lean()
            .select('username role fullName');

        if (!user) {
            return res.status(404).json({
                message: 'User account not found. Please contact administration.',
                code: 'USER_NOT_FOUND',
                username: username
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 3: Validate role == 'driver'
        // ════════════════════════════════════════════════════════
        if (user.role !== 'driver') {
            return res.status(403).json({
                message: 'Access denied. Only drivers can view assigned routes.',
                code: 'NOT_DRIVER',
                requiredRole: 'driver',
                actualRole: user.role
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 4: Lookup Crew record (multiple strategies for robustness)
        // ════════════════════════════════════════════════════════
        let crewMember = null;

        // Strategy 1: Match by fullName exactly
        if (user.fullName && user.fullName.trim()) {
            crewMember = await Crew.findOne({
                name: user.fullName.trim(),
                role: 'Driver'
            }).lean().select('crewId name role licenseNo assignedBus');
        }

        // Strategy 2: Match username (case-insensitive)
        if (!crewMember) {
            crewMember = await Crew.findOne({
                name: { $regex: new RegExp(`^${username}$`, 'i') },
                role: 'Driver'
            }).lean().select('crewId name role licenseNo assignedBus');
        }

        // Strategy 3: Partial name match with fullName
        // (handles cases like "Rajesh" stored in Crew but "Rajesh Kumar" in User)
        if (!crewMember && user.fullName) {
            const firstName = user.fullName.split(' ')[0];
            crewMember = await Crew.findOne({
                name: { $regex: new RegExp(`${firstName}`, 'i') },
                role: 'Driver'
            }).lean().select('crewId name role licenseNo assignedBus');
        }

        // Not found after all strategies
        if (!crewMember) {
            return res.status(404).json({
                message: 'Driver profile not found in crew database. Please contact administration to register your driver profile.',
                code: 'CREW_PROFILE_NOT_FOUND',
                username: username,
                userFullName: user.fullName,
                expectedRole: 'Driver',
                hint: 'Driver profile must exist in Crew collection with role=Driver'
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 5: Verify Crew record is valid driver
        // ════════════════════════════════════════════════════════
        if (crewMember.role !== 'Driver') {
            return res.status(403).json({
                message: 'Access denied. Your crew profile is not registered as a Driver.',
                code: 'NOT_CREW_DRIVER',
                crewProfile: crewMember.name,
                crewRole: crewMember.role
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 6: Fetch all scheduled trips for this driver
        // ════════════════════════════════════════════════════════
        const mySchedules = await Schedule.find({
            driver: crewMember.name  // Use driver name from Crew collection
        })
            .sort({ day: 1, time: 1 })
            .lean();

        // ════════════════════════════════════════════════════════
        // STEP 7: Handle no assignments (return early with empty data)
        // ════════════════════════════════════════════════════════
        if (mySchedules.length === 0) {
            return res.status(200).json({
                message: 'No routes assigned to you at this time.',
                code: 'NO_ROUTES_ASSIGNED',
                driver: {
                    crewId: crewMember.crewId,
                    name: crewMember.name,
                    assignedBus: crewMember.assignedBus || 'Not assigned',
                    licenseNo: crewMember.licenseNo || 'N/A'
                },
                stats: {
                    totalAssignedRoutes: 0,
                    uniqueBuses: 0,
                    uniqueRoutes: 0,
                    uniqueDays: 0,
                    completedTrips: 0,
                    scheduledTrips: 0,
                    inProgressTrips: 0,
                    cancelledTrips: 0
                },
                data: []
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 8-9: Fetch enriched Bus and Route data
        // ════════════════════════════════════════════════════════
        const busNumbers = [...new Set(mySchedules.map(s => s.bus))];
        const routeIds = [...new Set(mySchedules.map(s => s.route))];

        const buses = await Bus.find({ regNo: { $in: busNumbers } })
            .lean()
            .select('regNo type model capacity depot status');

        const routes = await Route.find({ routeId: { $in: routeIds } })
            .lean()
            .select('routeId name startPoint endPoint stopCount distance estimatedTime');

        // ════════════════════════════════════════════════════════
        // STEP 10: Validate all references exist (fail if broken)
        // ════════════════════════════════════════════════════════
        const busMap = new Map(buses.map(b => [b.regNo, b]));
        const routeMap = new Map(routes.map(r => [r.routeId, r]));

        // Check for referential integrity issues
        const missingBuses = [];
        const missingRoutes = [];

        for (const schedule of mySchedules) {
            if (!busMap.has(schedule.bus)) {
                missingBuses.push(schedule.bus);
            }
            if (!routeMap.has(schedule.route)) {
                missingRoutes.push(schedule.route);
            }
        }

        // If references are broken, alert admin
        if (missingBuses.length > 0 || missingRoutes.length > 0) {
            console.error('[SCHEDULE] REFERENTIAL INTEGRITY WARNING', {
                driver: crewMember.name,
                missingBuses: [...new Set(missingBuses)],
                missingRoutes: [...new Set(missingRoutes)]
            });
            return res.status(500).json({
                message: 'Schedule data integrity error. Some assigned resources are missing from database.',
                code: 'DATA_INTEGRITY_ERROR',
                missingBuses: [...new Set(missingBuses)],
                missingRoutes: [...new Set(missingRoutes)],
                action: 'Contact system administrator'
            });
        }

        // ════════════════════════════════════════════════════════
        // STEP 11: Build frontend-friendly enriched response
        // ════════════════════════════════════════════════════════
        const enrichedSchedules = mySchedules.map(schedule => ({
            _id: schedule._id,
            day: schedule.day,
            time: schedule.time,
            status: schedule.status,
            bus: {
                number: busMap.get(schedule.bus).regNo,
                type: busMap.get(schedule.bus).type,
                model: busMap.get(schedule.bus).model || 'Standard',
                capacity: busMap.get(schedule.bus).capacity,
                depot: busMap.get(schedule.bus).depot,
                busStatus: busMap.get(schedule.bus).status
            },
            route: {
                id: routeMap.get(schedule.route).routeId,
                name: schedule.routeName || routeMap.get(schedule.route).name,
                startPoint: routeMap.get(schedule.route).startPoint,
                endPoint: routeMap.get(schedule.route).endPoint,
                stopCount: routeMap.get(schedule.route).stopCount || 0,
                distance: routeMap.get(schedule.route).distance,
                estimatedTime: routeMap.get(schedule.route).estimatedTime
            },
            createdAt: schedule.createdAt,
            updatedAt: schedule.updatedAt
        }));

        // ════════════════════════════════════════════════════════
        // STEP 12: Calculate statistics and return response
        // ════════════════════════════════════════════════════════
        const stats = {
            totalAssignedRoutes: enrichedSchedules.length,
            uniqueBuses: [...new Set(enrichedSchedules.map(s => s.bus.number))].length,
            uniqueRoutes: [...new Set(enrichedSchedules.map(s => s.route.id))].length,
            uniqueDays: [...new Set(enrichedSchedules.map(s => s.day))].length,
            completedTrips: enrichedSchedules.filter(s => s.status === 'Completed').length,
            scheduledTrips: enrichedSchedules.filter(s => s.status === 'Scheduled').length,
            inProgressTrips: enrichedSchedules.filter(s => s.status === 'In-Progress').length,
            cancelledTrips: enrichedSchedules.filter(s => s.status === 'Cancelled').length
        };

        res.status(200).json({
            message: 'Driver schedule retrieved successfully.',
            code: 'DRIVER_SCHEDULE_FETCHED',
            timestamp: new Date().toISOString(),
            driver: {
                crewId: crewMember.crewId,
                name: crewMember.name,
                assignedBus: crewMember.assignedBus || 'Not assigned',
                licenseNo: crewMember.licenseNo || 'N/A'
            },
            stats: stats,
            data: enrichedSchedules
        });

    } catch (err) {
        console.error('[SCHEDULE] getMyRoute error:', {
            message: err.message,
            stack: err.stack,
            username: req.user?.username
        });
        res.status(500).json({
            message: 'Failed to fetch driver schedule. Please try again later.',
            code: 'SCHEDULE_FETCH_ERROR',
            action: 'Contact support if problem persists'
        });
    }
};
