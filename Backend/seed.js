/**
 * DTCSL Database Seeder
 * Run: node seed.js
 * Populates MongoDB with initial mock data
 */
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Route = require('./models/Route');
const Bus = require('./models/Bus');
const Crew = require('./models/Crew');
const Depot = require('./models/Depot');
const Schedule = require('./models/Schedule');

const seedData = async () => {
    await connectDB();

    // Clear existing data
    await Promise.all([
        User.deleteMany(),
        Route.deleteMany(),
        Bus.deleteMany(),
        Crew.deleteMany(),
        Depot.deleteMany(),
        Schedule.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing data');

    // ═══════════ DEPOTS (only 2) ═══════════
    const depots = await Depot.create([
        { name: 'Kashmiri Gate Depot',  location: 'Kashmiri Gate, Delhi',   totalCapacity: 50, busCount: 4, routeCount: 2, crewCount: 6, utilization: 78 },
        { name: 'Nehru Place Depot',    location: 'Nehru Place, Delhi',     totalCapacity: 50, busCount: 4, routeCount: 2, crewCount: 6, utilization: 65 },
    ]);
    console.log('✅ Depots seeded (2)');

    const depot1 = depots[0]; // Kashmiri Gate
    const depot2 = depots[1]; // Nehru Place

    // ═══════════ USERS ═══════════
    await User.create([
        { username: 'admin',     password: 'admin123',     role: 'admin',     fullName: 'Admin User',      email: 'admin@dtcsl.gov.in',     phone: '+91 98765 43210', location: 'Delhi, India' },
        { username: 'depot1',    password: 'depot123',     role: 'depot',     fullName: 'KG Manager',      email: 'depot1@dtcsl.gov.in',    phone: '+91 98765 43211', location: 'Delhi, India', depot: depot1.name, depotId: depot1._id },
        { username: 'depot2',    password: 'depot123',     role: 'depot',     fullName: 'NP Manager',      email: 'depot2@dtcsl.gov.in',    phone: '+91 98765 43220', location: 'Delhi, India', depot: depot2.name, depotId: depot2._id },
        { username: 'driver',    password: 'driver123',    role: 'driver',    fullName: 'Rajesh Kumar',    email: 'driver@dtcsl.gov.in',    phone: '+91 98765 43212', location: 'Delhi, India', depot: depot1.name, depotId: depot1._id },
        { username: 'passenger', password: 'passenger123', role: 'passenger', fullName: 'Priya Sharma',    email: 'passenger@dtcsl.gov.in', phone: '+91 98765 43213', location: 'Delhi, India' },
    ]);
    console.log('✅ Users seeded');

    // ═══════════ ROUTES (4 total — 2 per depot) ═══════════
    await Route.create([
        // ── Depot 1: Kashmiri Gate Depot ──
        {
            routeId: 'RT-001',
            name: 'Kashmiri Gate → Chandni Chowk',
            startPoint: 'Kashmiri Gate ISBT',
            endPoint: 'Chandni Chowk',
            stops: 8,
            stopNames: [
                'Kashmiri Gate ISBT',
                'Kashmiri Gate Metro',
                'Lal Quila (Red Fort)',
                'Jama Masjid',
                'Chawri Bazar',
                'Nai Sarak',
                'Town Hall',
                'Chandni Chowk'
            ],
            distance: 5.2,
            depot: depot1.name,
            depotId: depot1._id,
            status: 'Active',
            coordinates: [{ lat: 28.6669, lng: 77.2287 }, { lat: 28.6562, lng: 77.2306 }]
        },
        {
            routeId: 'RT-002',
            name: 'Kashmiri Gate → Rajiv Chowk',
            startPoint: 'Kashmiri Gate ISBT',
            endPoint: 'Rajiv Chowk',
            stops: 7,
            stopNames: [
                'Kashmiri Gate ISBT',
                'Civil Lines',
                'Vidhan Sabha',
                'Pul Bangash',
                'Sadar Bazar',
                'New Delhi Railway Station',
                'Rajiv Chowk'
            ],
            distance: 7.8,
            depot: depot1.name,
            depotId: depot1._id,
            status: 'Active',
            coordinates: [{ lat: 28.6669, lng: 77.2287 }, { lat: 28.6315, lng: 77.2184 }]
        },
        // ── Depot 2: Nehru Place Depot ──
        {
            routeId: 'RT-003',
            name: 'Nehru Place → Hauz Khas',
            startPoint: 'Nehru Place',
            endPoint: 'Hauz Khas',
            stops: 6,
            stopNames: [
                'Nehru Place Terminal',
                'Kalkaji Mandir',
                'Govindpuri',
                'Malviya Nagar',
                'Panchsheel Park',
                'Hauz Khas'
            ],
            distance: 8.5,
            depot: depot2.name,
            depotId: depot2._id,
            status: 'Active',
            coordinates: [{ lat: 28.5491, lng: 77.2533 }, { lat: 28.5494, lng: 77.2001 }]
        },
        {
            routeId: 'RT-004',
            name: 'Nehru Place → Sarojini Nagar',
            startPoint: 'Nehru Place',
            endPoint: 'Sarojini Nagar',
            stops: 7,
            stopNames: [
                'Nehru Place Terminal',
                'Moolchand',
                'Lajpat Nagar',
                'Defence Colony',
                'South Extension',
                'AIIMS',
                'Sarojini Nagar'
            ],
            distance: 10.3,
            depot: depot2.name,
            depotId: depot2._id,
            status: 'Active',
            coordinates: [{ lat: 28.5491, lng: 77.2533 }, { lat: 28.5784, lng: 77.2042 }]
        }
    ]);
    console.log('✅ Routes seeded (4 — 2 per depot)');

    // ═══════════ BUSES (4 per depot = 8 total) ═══════════
    await Bus.create([
        // Depot 1
        { regNo: 'DL-1PA-1234', type: 'AC',       capacity: 50, depot: depot1.name, depotId: depot1._id, status: 'Active',            lastService: new Date('2026-03-15') },
        { regNo: 'DL-1PA-3344', type: 'AC',       capacity: 50, depot: depot1.name, depotId: depot1._id, status: 'Active',            lastService: new Date('2026-03-19') },
        { regNo: 'DL-1PA-9012', type: 'Electric', capacity: 45, depot: depot1.name, depotId: depot1._id, status: 'Under Maintenance', lastService: new Date('2026-03-10') },
        { regNo: 'DL-1PA-1122', type: 'Non-AC',   capacity: 55, depot: depot1.name, depotId: depot1._id, status: 'Active',            lastService: new Date('2026-03-20') },
        // Depot 2
        { regNo: 'DL-1PA-5678', type: 'Non-AC',   capacity: 60, depot: depot2.name, depotId: depot2._id, status: 'Active',            lastService: new Date('2026-03-12') },
        { regNo: 'DL-1PA-7890', type: 'Non-AC',   capacity: 55, depot: depot2.name, depotId: depot2._id, status: 'Active',            lastService: new Date('2026-03-18') },
        { regNo: 'DL-1PA-3456', type: 'AC',       capacity: 50, depot: depot2.name, depotId: depot2._id, status: 'Active',            lastService: new Date('2026-03-08') },
        { regNo: 'DL-1PA-5566', type: 'Electric', capacity: 40, depot: depot2.name, depotId: depot2._id, status: 'Under Maintenance', lastService: new Date('2026-03-05') },
    ]);
    console.log('✅ Buses seeded (8 — 4 per depot)');

    // ═══════════ CREW ═══════════
    await Crew.create([
        // Depot 1 — Kashmiri Gate
        { crewId: 'CR-001', name: 'Rajesh Kumar',  role: 'Driver',    licenseNo: 'DL-0420110012345', phone: '+91 98765 43210', assignedBus: 'DL-1PA-1234', depot: depot1.name, depotId: depot1._id, status: 'On Duty' },
        { crewId: 'CR-002', name: 'Suresh Yadav',  role: 'Driver',    licenseNo: 'DL-0420110067890', phone: '+91 98765 43212', assignedBus: 'DL-1PA-3344', depot: depot1.name, depotId: depot1._id, status: 'On Duty' },
        { crewId: 'CR-003', name: 'Priya Verma',   role: 'Conductor', phone: '+91 98765 43215', assignedBus: 'DL-1PA-1234', depot: depot1.name, depotId: depot1._id, status: 'On Duty' },
        // Depot 2 — Nehru Place
        { crewId: 'CR-004', name: 'Amit Singh',    role: 'Driver',    licenseNo: 'DL-0420110054321', phone: '+91 98765 43211', assignedBus: 'DL-1PA-5678', depot: depot2.name, depotId: depot2._id, status: 'On Duty' },
        { crewId: 'CR-005', name: 'Mohit Sharma',  role: 'Driver',    licenseNo: 'DL-0420110022222', phone: '+91 98765 43214', assignedBus: 'DL-1PA-7890', depot: depot2.name, depotId: depot2._id, status: 'On Duty' },
        { crewId: 'CR-006', name: 'Rahul Joshi',   role: 'Conductor', phone: '+91 98765 43219', assignedBus: 'DL-1PA-5678', depot: depot2.name, depotId: depot2._id, status: 'On Duty' },
    ]);
    console.log('✅ Crew seeded (6 — 3 per depot)');

    // ═══════════ SCHEDULE ═══════════
    const today = new Date().toISOString().split('T')[0];
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = dayNames[new Date().getDay()];
    await Schedule.create([
        // Depot 1
        { date: today, day: dayName, time: '06:00', route: 'RT-001', routeName: 'Kashmiri Gate → Chandni Chowk',  bus: 'DL-1PA-1234', driver: 'Rajesh Kumar', driverId: 'CR-001', depot: depot1.name, depotId: depot1._id },
        { date: today, day: dayName, time: '08:00', route: 'RT-002', routeName: 'Kashmiri Gate → Rajiv Chowk',    bus: 'DL-1PA-3344', driver: 'Suresh Yadav', driverId: 'CR-002', depot: depot1.name, depotId: depot1._id },
        // Depot 2
        { date: today, day: dayName, time: '07:00', route: 'RT-003', routeName: 'Nehru Place → Hauz Khas',        bus: 'DL-1PA-5678', driver: 'Amit Singh',   driverId: 'CR-004', depot: depot2.name, depotId: depot2._id },
        { date: today, day: dayName, time: '09:00', route: 'RT-004', routeName: 'Nehru Place → Sarojini Nagar',   bus: 'DL-1PA-7890', driver: 'Mohit Sharma', driverId: 'CR-005', depot: depot2.name, depotId: depot2._id },
    ]);
    console.log('✅ Schedule seeded (4 entries)');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
};

seedData().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
