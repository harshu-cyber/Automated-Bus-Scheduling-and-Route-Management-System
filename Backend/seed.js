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

    // ═══════════ USERS ═══════════
    await User.create([
        { username: 'admin',  password: 'admin123',  role: 'admin',  fullName: 'Admin User',    email: 'admin@dtcsl.gov.in',  phone: '+91 98765 43210', location: 'Delhi, India' },
        { username: 'depot',  password: 'depot123',  role: 'depot',  fullName: 'Depot Manager', email: 'depot@dtcsl.gov.in',  phone: '+91 98765 43211' },
        { username: 'driver', password: 'driver123', role: 'driver', fullName: 'Rajesh Kumar',  email: 'driver@dtcsl.gov.in', phone: '+91 98765 43212' },
    ]);
    console.log('✅ Users seeded');

    // ═══════════ ROUTES ═══════════
    await Route.create([
        { routeId: 'RT-001', name: 'Kashmiri Gate → ISBT',          startPoint: 'Kashmiri Gate',  endPoint: 'ISBT',             stops: 12, distance: 18.5, status: 'Active',      coordinates: [{ lat: 28.6669, lng: 77.2287 }, { lat: 28.6565, lng: 77.2280 }, { lat: 28.6430, lng: 77.2190 }] },
        { routeId: 'RT-002', name: 'Sarojini Nagar → CP',           startPoint: 'Sarojini Nagar', endPoint: 'Connaught Place',   stops: 8,  distance: 12.3, status: 'Active',      coordinates: [{ lat: 28.5784, lng: 77.2042 }, { lat: 28.5965, lng: 77.2107 }, { lat: 28.6315, lng: 77.2184 }] },
        { routeId: 'RT-003', name: 'Chandni Chowk → Lajpat Nagar',  startPoint: 'Chandni Chowk',  endPoint: 'Lajpat Nagar',     stops: 15, distance: 22.1, status: 'Active',      coordinates: [{ lat: 28.6506, lng: 77.2306 }, { lat: 28.6342, lng: 77.2310 }, { lat: 28.5710, lng: 77.2395 }] },
        { routeId: 'RT-004', name: 'Dwarka → Noida City Centre',    startPoint: 'Dwarka Sec 21',  endPoint: 'Noida City Centre', stops: 20, distance: 35.7, status: 'Maintenance', coordinates: [] },
        { routeId: 'RT-005', name: 'Nehru Place → Hauz Khas',       startPoint: 'Nehru Place',    endPoint: 'Hauz Khas',         stops: 6,  distance: 8.2,  status: 'Active',      coordinates: [] },
        { routeId: 'RT-006', name: 'Rohini → Rajiv Chowk',          startPoint: 'Rohini',         endPoint: 'Rajiv Chowk',       stops: 14, distance: 19.8, status: 'Inactive',    coordinates: [] },
    ]);
    console.log('✅ Routes seeded');

    // ═══════════ BUSES ═══════════
    await Bus.create([
        { regNo: 'DL-1PA-1234', type: 'AC',       capacity: 50, depot: 'Kashmiri Gate',  status: 'Active',            lastService: new Date('2026-03-15') },
        { regNo: 'DL-1PA-5678', type: 'Non-AC',   capacity: 60, depot: 'Sarojini Nagar', status: 'Active',            lastService: new Date('2026-03-12') },
        { regNo: 'DL-1PA-9012', type: 'Electric',  capacity: 45, depot: 'Chandni Chowk',  status: 'Under Maintenance', lastService: new Date('2026-03-10') },
        { regNo: 'DL-1PA-3456', type: 'AC',       capacity: 50, depot: 'Dwarka',         status: 'Breakdown',         lastService: new Date('2026-03-08') },
        { regNo: 'DL-1PA-7890', type: 'Non-AC',   capacity: 55, depot: 'Nehru Place',    status: 'Active',            lastService: new Date('2026-03-18') },
        { regNo: 'DL-1PA-1122', type: 'Electric',  capacity: 40, depot: 'Rohini',         status: 'Active',            lastService: new Date('2026-03-20') },
        { regNo: 'DL-1PA-3344', type: 'AC',       capacity: 50, depot: 'Kashmiri Gate',  status: 'Active',            lastService: new Date('2026-03-19') },
        { regNo: 'DL-1PA-5566', type: 'Non-AC',   capacity: 60, depot: 'Dwarka',         status: 'Under Maintenance', lastService: new Date('2026-03-05') },
    ]);
    console.log('✅ Buses seeded');

    // ═══════════ CREW ═══════════
    await Crew.create([
        { crewId: 'CR-001', name: 'Rajesh Kumar',  role: 'Driver',    licenseNo: 'DL-0420110012345', phone: '+91 98765 43210', assignedBus: 'DL-1PA-1234', status: 'On Duty' },
        { crewId: 'CR-002', name: 'Amit Singh',    role: 'Driver',    licenseNo: 'DL-0420110054321', phone: '+91 98765 43211', assignedBus: 'DL-1PA-5678', status: 'On Duty' },
        { crewId: 'CR-003', name: 'Suresh Yadav',  role: 'Driver',    licenseNo: 'DL-0420110067890', phone: '+91 98765 43212', assignedBus: 'DL-1PA-9012', status: 'Off Duty' },
        { crewId: 'CR-004', name: 'Vikram Patel',  role: 'Driver',    licenseNo: 'DL-0420110011111', phone: '+91 98765 43213', assignedBus: 'DL-1PA-3456', status: 'On Leave' },
        { crewId: 'CR-005', name: 'Mohit Sharma',  role: 'Driver',    licenseNo: 'DL-0420110022222', phone: '+91 98765 43214', assignedBus: 'DL-1PA-7890', status: 'On Duty' },
        { crewId: 'CR-006', name: 'Priya Verma',   role: 'Conductor', phone: '+91 98765 43215', assignedBus: 'DL-1PA-1234', status: 'On Duty' },
        { crewId: 'CR-007', name: 'Deepak Rawat',  role: 'Conductor', phone: '+91 98765 43216', assignedBus: 'DL-1PA-1122', status: 'On Duty' },
        { crewId: 'CR-008', name: 'Anil Kumar',    role: 'Conductor', phone: '+91 98765 43217', assignedBus: 'DL-1PA-5566', status: 'Off Duty' },
        { crewId: 'CR-009', name: 'Neha Gupta',    role: 'Driver',    licenseNo: 'DL-0420110033333', phone: '+91 98765 43218', assignedBus: '—',           status: 'Off Duty' },
        { crewId: 'CR-010', name: 'Rahul Joshi',   role: 'Conductor', phone: '+91 98765 43219', assignedBus: 'DL-1PA-5678', status: 'On Duty' },
    ]);
    console.log('✅ Crew seeded');

    // ═══════════ DEPOTS ═══════════
    await Depot.create([
        { name: 'Kashmiri Gate Depot',  location: 'Kashmiri Gate, Delhi',  totalCapacity: 41, busCount: 32, routeCount: 18, crewCount: 64, utilization: 78 },
        { name: 'Dwarka Depot',         location: 'Dwarka Sec 21, Delhi', totalCapacity: 45, busCount: 28, routeCount: 14, crewCount: 56, utilization: 62 },
        { name: 'Rohini Depot',         location: 'Rohini Sec 5, Delhi',  totalCapacity: 44, busCount: 24, routeCount: 10, crewCount: 48, utilization: 55 },
        { name: 'Nehru Place Depot',    location: 'Nehru Place, Delhi',   totalCapacity: 44, busCount: 20, routeCount: 8,  crewCount: 40, utilization: 45 },
        { name: 'Sarojini Nagar Depot', location: 'Sarojini Nagar, Delhi',totalCapacity: 41, busCount: 38, routeCount: 17, crewCount: 76, utilization: 92 },
    ]);
    console.log('✅ Depots seeded');

    // ═══════════ SCHEDULE ═══════════
    await Schedule.create([
        { day: 'Monday',    time: '06:00', route: 'RT-001', routeName: 'Kashmiri Gate',  bus: 'DL-1PA-1234', driver: 'Rajesh Kumar' },
        { day: 'Monday',    time: '07:30', route: 'RT-002', routeName: 'Sarojini Nagar', bus: 'DL-1PA-5678', driver: 'Amit Singh' },
        { day: 'Monday',    time: '09:00', route: 'RT-003', routeName: 'Chandni Chowk',  bus: 'DL-1PA-9012', driver: 'Suresh Yadav' },
        { day: 'Tuesday',   time: '06:00', route: 'RT-001', routeName: 'Kashmiri Gate',  bus: 'DL-1PA-3344', driver: 'Vikram Patel' },
        { day: 'Tuesday',   time: '07:30', route: 'RT-005', routeName: 'Nehru Place',    bus: 'DL-1PA-7890', driver: 'Mohit Sharma' },
        { day: 'Tuesday',   time: '10:30', route: 'RT-004', routeName: 'Dwarka',         bus: 'DL-1PA-5566', driver: 'Anil Kumar' },
        { day: 'Wednesday', time: '06:00', route: 'RT-002', routeName: 'Sarojini Nagar', bus: 'DL-1PA-1234', driver: 'Rajesh Kumar' },
        { day: 'Wednesday', time: '07:30', route: 'RT-006', routeName: 'Rohini',         bus: 'DL-1PA-1122', driver: 'Deepak Rawat' },
        { day: 'Wednesday', time: '09:00', route: 'RT-001', routeName: 'Kashmiri Gate',  bus: 'DL-1PA-5678', driver: 'Amit Singh' },
        { day: 'Thursday',  time: '06:00', route: 'RT-003', routeName: 'Chandni Chowk',  bus: 'DL-1PA-3456', driver: 'Vikram Patel' },
        { day: 'Thursday',  time: '09:00', route: 'RT-005', routeName: 'Nehru Place',    bus: 'DL-1PA-7890', driver: 'Mohit Sharma' },
        { day: 'Friday',    time: '06:00', route: 'RT-001', routeName: 'Kashmiri Gate',  bus: 'DL-1PA-1234', driver: 'Rajesh Kumar' },
        { day: 'Friday',    time: '07:30', route: 'RT-004', routeName: 'Dwarka',         bus: 'DL-1PA-5566', driver: 'Anil Kumar' },
        { day: 'Saturday',  time: '06:00', route: 'RT-002', routeName: 'Sarojini Nagar', bus: 'DL-1PA-5678', driver: 'Amit Singh' },
        { day: 'Sunday',    time: '08:00', route: 'RT-001', routeName: 'Kashmiri Gate',  bus: 'DL-1PA-1234', driver: 'Rajesh Kumar' },
    ]);
    console.log('✅ Schedule seeded');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
};

seedData().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
