const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5005;

// ═══════════ MIDDLEWARE ═══════════
app.use(cors());
app.use(express.json());

// ═══════════ ROUTES ═══════════
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/routes',    require('./routes/routes'));
app.use('/api/buses',     require('./routes/buses'));
app.use('/api/schedule',  require('./routes/schedule'));
app.use('/api/crew',      require('./routes/crew'));
app.use('/api/depots',    require('./routes/depots'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/leaves',    require('./routes/leaves'));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'DTCSL API is running', version: '2.0.0 (Socket.io Enabled)' });
});

// ═══════════ SOCKET.IO LOGIC ═══════════
const locationSocket = require('./sockets/locationSocket');
locationSocket(io);

// ═══════════ START SERVER ═══════════
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`🚌 DTCSL API (Socket.io) server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('SERVER FAILED TO START:', err.message);
    }
};

startServer();
